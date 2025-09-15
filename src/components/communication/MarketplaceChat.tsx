import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/translations";
import { useRealtimeMessaging } from "@/hooks/use-realtime-messaging";
import { useNotificationSystem } from "@/hooks/use-notification-system";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface MarketplaceChatProps {
  productId: string;
  sellerId: string;
  productTitle: string;
  onBack?: () => void;
}

interface SellerProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export default function MarketplaceChat({
  productId,
  sellerId,
  productTitle,
  onBack,
}: MarketplaceChatProps) {
  const { user, language } = useAuth();
  const { t } = useTranslation(language);
  const { sendMessageNotification } = useNotificationSystem();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(
    null
  );
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const {
    messages,
    sendMessage,
    isLoading: messagesLoading,
  } = useRealtimeMessaging(roomId || undefined);

  // Create or get existing chat room for this product
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !sellerId) return;

      try {
        // Get seller profile
        const { data: seller } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("user_id", sellerId)
          .single();

        if (seller) {
          setSellerProfile(seller);
        }

        // Check if a chat room already exists for this product and users
        const { data: existingRoom } = await supabase
          .from("chat_rooms")
          .select("id")
          .eq("room_type", "marketplace")
          .eq("name", `Product: ${productTitle}`)
          .eq("created_by", user.id)
          .single();

        if (existingRoom) {
          setRoomId(existingRoom.id);
        } else {
          // Create new marketplace chat room
          const { data: newRoom, error: roomError } = await supabase
            .from("chat_rooms")
            .insert({
              name: `Product: ${productTitle}`,
              room_type: "marketplace",
              is_private: true,
              created_by: user.id,
              max_members: 2,
            })
            .select("id")
            .single();

          if (roomError) throw roomError;

          // Add both users to the room
          const { error: membersError } = await supabase
            .from("chat_room_members")
            .insert([
              {
                room_id: newRoom.id,
                user_id: user.id,
                is_admin: true,
              },
              {
                room_id: newRoom.id,
                user_id: sellerId,
                is_admin: false,
              },
            ]);

          if (membersError) throw membersError;
          setRoomId(newRoom.id);
        }
      } catch (error) {
        console.error("Error initializing marketplace chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [user, sellerId, productTitle]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !roomId) return;

    try {
      await sendMessage(messageText, "text", undefined, undefined, {
        isMarketplaceChat: true,
        recipientIds: [sellerId], // Notify the seller
      });
      setMessageText("");
    } catch (error) {
      console.error("Error sending marketplace message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {t('loadingChat')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">
                {productTitle}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={sellerProfile?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {sellerProfile?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {sellerProfile?.full_name || language === "en"
                    ? "Seller"
                    : "Penjual"}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {t('marketplaceChat')}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {messagesLoading ? (
            <div className="text-center text-muted-foreground">
              {t('loadingMessages')}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">
                {language === "en"
                  ? "Start a conversation about this product"
                  : "Mulai percakapan tentang produk ini"}
              </p>
              <p className="text-sm">
                {language === "en"
                  ? "Ask questions about features, pricing, or availability"
                  : "Tanyakan tentang fitur, harga, atau ketersediaan"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${
                        isOwnMessage ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.sender_profile?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {isOwnMessage
                            ? user?.email?.charAt(0).toUpperCase()
                            : message.sender_profile?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`flex flex-col ${
                          isOwnMessage ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.message_text}
                          </p>
                        </div>

                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder={
                language === "en"
                  ? "Ask about this product..."
                  : "Tanya tentang produk ini..."
              }
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || !roomId}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
