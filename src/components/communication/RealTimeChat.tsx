import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Users, MessageCircle, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_role: string;
  created_at: string;
  channel: string;
}

interface Props {
  selectedChannel: string;
}

export function RealTimeChat({ selectedChannel }: Props) {
  const { user, language } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load real messages from database and set up real-time subscriptions
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Fetch messages from the database based on channel
        const { data: chatMessages, error } = await supabase
          .from("chat_messages")
          .select(
            `
            id,
            message_text,
            created_at,
            sender_id,
            profiles!inner(full_name, email)
          `
          )
          .eq("room_id", selectedChannel)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true })
          .limit(50);

        if (error) {
          console.error("Error loading messages:", error);
          return;
        }

        // Transform database messages to UI format
        const transformedMessages: Message[] = (chatMessages || []).map(
          (msg) => ({
            id: msg.id,
            content: msg.message_text,
            sender_name:
              msg.profiles?.full_name || msg.profiles?.email || "Unknown User",
            sender_role: "resident", // Default role - could be enhanced to fetch user roles
            created_at: msg.created_at,
            channel: selectedChannel,
          })
        );

        setMessages(transformedMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
        // Fallback to welcome message if no messages exist
        if (messages.length === 0) {
          const welcomeMessage: Message = {
            id: "welcome",
            content:
              language === "en"
                ? "Welcome to the community chat! Feel free to ask questions or share updates."
                : "Selamat datang ke sembang komuniti! Jangan ragu untuk bertanya atau berkongsi maklumat.",
            sender_name: "Community Admin",
            sender_role: "admin",
            created_at: new Date().toISOString(),
            channel: selectedChannel,
          };
          setMessages([welcomeMessage]);
        }
      }
    };

    loadMessages();

    // Set up real-time subscriptions for both messages and presence
    const channel = supabase
      .channel(`chat-${selectedChannel}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${selectedChannel}`,
        },
        async (payload) => {
          // Fetch sender profile for new message
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", payload.new.sender_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.message_text,
            sender_name:
              senderProfile?.full_name ||
              senderProfile?.email ||
              "Unknown User",
            sender_role: "resident",
            created_at: payload.new.created_at,
            channel: selectedChannel,
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        const users = Object.values(newState).flat();
        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track user presence
          await channel.track({
            user_id: user?.id,
            display_name: user?.display_name || user?.email || "Anonymous",
            role: user?.user_role || "resident",
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChannel, user, language]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    try {
      // Save message to database - this will trigger the real-time subscription
      const { error } = await supabase.from("chat_messages").insert({
        room_id: selectedChannel,
        sender_id: user.id,
        message_text: messageText,
        message_type: "text",
      });

      if (error) {
        console.error("Error sending message:", error);
        // Restore message on error
        setNewMessage(messageText);
        return;
      }

      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message on error
      setNewMessage(messageText);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "security":
        return "bg-purple-100 text-purple-800";
      case "resident":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Main Chat Area */}
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                {selectedChannel.replace("-", " ")}
              </CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {onlineUsers.length}{" "}
                {language === "en" ? "online" : "dalam talian"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                    {message.sender_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.sender_name}
                      </span>
                      <Badge className={getRoleColor(message.sender_role)}>
                        {message.sender_role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder={
                    language === "en"
                      ? `Message #${selectedChannel.replace("-", " ")}...`
                      : `Mesej #${selectedChannel.replace("-", " ")}...`
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Online Users Sidebar */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              {language === "en" ? "Online Users" : "Pengguna Dalam Talian"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Current User */}
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-medium">
                {user?.display_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.display_name} (You)
                </p>
                <Badge className={getRoleColor(user?.user_role || "resident")}>
                  {user?.user_role}
                </Badge>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>

            {/* Real Online Users */}
            {onlineUsers.map((onlineUser: any, index) => (
              <div
                key={onlineUser.user_id || index}
                className="flex items-center gap-2 p-2 hover:bg-muted/30 rounded-lg transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {(onlineUser.display_name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {onlineUser.display_name || "Anonymous User"}
                  </p>
                  <Badge
                    className={getRoleColor(onlineUser.role || "resident")}
                  >
                    {onlineUser.role || "resident"}
                  </Badge>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            ))}

            {onlineUsers.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {language === "en"
                    ? "No users online"
                    : "Tiada pengguna dalam talian"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
