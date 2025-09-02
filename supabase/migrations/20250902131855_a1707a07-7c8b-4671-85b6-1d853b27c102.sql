-- RLS policies for announcement_views
CREATE POLICY "Users can insert their own views" ON announcement_views
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own views" ON announcement_views
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all views" ON announcement_views
  FOR SELECT USING (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  );

-- RLS policies for announcement_reactions  
CREATE POLICY "Users can manage their own reactions" ON announcement_reactions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Everyone can view reactions" ON announcement_reactions
  FOR SELECT USING (true);

-- RLS policies for announcement_comments
CREATE POLICY "Users can insert their own comments" ON announcement_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON announcement_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Everyone can view comments" ON announcement_comments
  FOR SELECT USING (true);

CREATE POLICY "Admins can delete any comment" ON announcement_comments
  FOR DELETE USING (
    user_id = auth.uid() OR
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  );

-- RLS policies for announcement_bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON announcement_bookmarks
  FOR ALL USING (user_id = auth.uid());

-- RLS policies for announcement_read_receipts  
CREATE POLICY "Users can manage their own read receipts" ON announcement_read_receipts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all read receipts" ON announcement_read_receipts
  FOR SELECT USING (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  );