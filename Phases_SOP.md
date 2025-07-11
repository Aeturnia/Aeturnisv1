# Phases SOP - Detailed Implementation Guide
**Based on Working SOP Guidelines v1.0**
**Starting from Phase 3, Step 3.3**

## Phase 3: Mobile UI/UX (Weeks 5-6)

### Step 3.3: Combat & Resources UI [P3-3-03]

#### Overview
Implement the combat interface and resource display systems with real-time updates and mobile-optimized interactions.

#### Division of Labor

**Claude Code Tasks:**
1. **Combat State Management**
   - Real-time combat state synchronization
   - Action validation logic
   - Cooldown calculations
   - Combat log formatting service
   - Resource calculations (HP/MP/Stamina)

2. **Resource System Logic**
   - Regeneration calculations
   - Buff/debuff effect processing
   - Resource cap management
   - Combat resource consumption

**Replit Agent Tasks:**
1. **Combat UI Components**
   - Action selection interface
   - Target selection UI
   - Combat log display component
   - Turn indicator

2. **Resource Bar Components**
   - HP/Mana/Stamina bar visuals
   - Buff/debuff icon display
   - Cooldown indicator overlays
   - Smooth animation transitions

#### Implementation Steps

1. **Combat Interface Foundation** (Both)
   ```typescript
   // Claude: Define combat UI state interface
   interface CombatUIState {
     actions: AvailableAction[];
     targets: ValidTarget[];
     combatLog: CombatLogEntry[];
     currentTurn: number;
     timeRemaining: number;
   }
   ```

2. **Resource Display System** (Replit)
   - Create responsive resource bars
   - Implement percentage-based fills
   - Add numeric overlays
   - Smooth transition animations

3. **Action System** (Claude)
   - Calculate available actions based on resources
   - Implement cooldown tracking
   - Validate target selection
   - Process action outcomes

4. **Visual Feedback** (Replit)
   - Damage/heal number popups
   - Screen shake on critical hits
   - Resource change animations
   - Status effect indicators

#### Success Criteria
- [ ] Combat actions execute within 100ms
- [ ] Resource bars update smoothly (60fps)
- [ ] All cooldowns display accurately
- [ ] Combat log shows last 50 entries
- [ ] Mobile touch targets ≥ 44x44px

---

### Step 3.4: Inventory & Equipment UI [P3-3-04]

#### Overview
Create a mobile-optimized inventory and equipment management system with drag-and-drop functionality.

#### Division of Labor

**Claude Code Tasks:**
1. **Equipment Logic**
   - Stat calculation from equipped items
   - Equipment validation rules
   - Set bonus calculations
   - Durability tracking

2. **Inventory Management**
   - Item stacking logic
   - Sort algorithms
   - Filter implementations
   - Weight calculations

**Replit Agent Tasks:**
1. **Equipment Interface**
   - Equipment slot visualization
   - Drag-drop implementation
   - Stat preview tooltips
   - Set bonus indicators

2. **Inventory Grid**
   - Grid-based layout
   - Item icons and stacks
   - Search/filter UI
   - Quick action buttons

#### Implementation Steps

1. **Equipment System** (Claude)
   ```typescript
   // Calculate total stats from equipment
   interface EquipmentStats {
     calculateTotalStats(equipped: Equipment[]): CharacterStats;
     getSetBonuses(equipped: Equipment[]): SetBonus[];
     validateEquipment(item: Item, slot: EquipmentSlot): boolean;
   }
   ```

2. **Inventory Grid** (Replit)
   - Implement virtual scrolling for performance
   - Create responsive grid layout
   - Add touch-friendly item selection
   - Implement multi-select for bulk actions

3. **Drag & Drop** (Replit)
   - Touch-compatible drag handlers
   - Visual feedback during drag
   - Valid drop zone highlighting
   - Revert animation on invalid drop

4. **Item Actions** (Both)
   - Claude: Action validation logic
   - Replit: Context menu UI
   - Claude: Bulk operation processing
   - Replit: Confirmation dialogs

#### Success Criteria
- [ ] Drag-drop works on all devices
- [ ] Inventory loads <500ms for 500 items
- [ ] Equipment changes reflect immediately
- [ ] Set bonuses calculate correctly
- [ ] Search filters update in real-time

---

### Step 3.5: Social & Banking UI [P3-3-05]

#### Overview
Implement banking interface and social features with secure item/currency transfers.

#### Division of Labor

**Claude Code Tasks:**
1. **Banking Logic**
   - Transaction validation
   - Storage limit checks
   - Transfer security
   - Audit logging

2. **Social Systems**
   - Friend list management
   - Party formation logic
   - Online status tracking
   - Permission systems

**Replit Agent Tasks:**
1. **Banking UI**
   - Tab navigation
   - Transfer interface
   - Storage visualization
   - Upgrade prompts

2. **Social Interface**
   - Friends list display
   - Party management UI
   - Status indicators
   - Quick actions

#### Implementation Steps

1. **Banking Foundation** (Claude)
   ```typescript
   interface BankingService {
     validateTransfer(from: Storage, to: Storage, items: Item[]): ValidationResult;
     executeTransfer(transfer: Transfer): Promise<TransferResult>;
     getStorageCapacity(accountId: string): StorageInfo;
   }
   ```

2. **Banking UI** (Replit)
   - Tabbed interface for multiple vaults
   - Drag-drop between storages
   - Visual capacity indicators
   - Transaction history view

3. **Social Features** (Both)
   - Claude: Real-time status updates via WebSocket
   - Replit: Online/offline indicators
   - Claude: Party invitation system
   - Replit: Invitation notifications

4. **Security** (Claude)
   - Two-factor authentication for high-value transfers
   - Rate limiting on transfers
   - Suspicious activity detection
   - Transaction rollback capability

#### Success Criteria
- [ ] Bank transfers complete <1 second
- [ ] No item duplication bugs
- [ ] Friend status updates real-time
- [ ] Party UI supports 8 members
- [ ] All transfers are audited

---

### Step 3.6: Chat & Communication [P3-3-06]

#### Overview
Build a mobile-optimized chat system with multiple channels and rich communication features.

#### Division of Labor

**Claude Code Tasks:**
1. **Chat Backend**
   - Message routing logic
   - Channel management
   - Permission checking
   - Profanity filtering

2. **Notification System**
   - Push notification integration
   - Notification preferences
   - Badge counter logic
   - Sound alert management

**Replit Agent Tasks:**
1. **Chat UI**
   - Collapsible chat window
   - Channel tab interface
   - Message composition
   - Emoji picker

2. **Notification UI**
   - In-app notification toasts
   - Badge displays
   - Notification center
   - Settings interface

#### Implementation Steps

1. **Chat Architecture** (Claude)
   ```typescript
   interface ChatService {
     sendMessage(channel: Channel, message: Message): Promise<void>;
     joinChannel(channelId: string): Promise<void>;
     getMessageHistory(channel: Channel, limit: number): Message[];
     filterProfanity(text: string): string;
   }
   ```

2. **Chat Interface** (Replit)
   - Minimize/maximize animations
   - Touch-friendly channel switching
   - Virtual keyboard handling
   - Message timestamps

3. **Rich Features** (Both)
   - Claude: Emoji processing
   - Replit: Emoji picker UI
   - Claude: Mention system (@player)
   - Replit: Mention autocomplete

4. **Notifications** (Both)
   - Claude: WebPush API integration
   - Replit: Permission request UI
   - Claude: Notification queuing
   - Replit: Custom notification styles

#### Success Criteria
- [ ] Messages deliver <100ms
- [ ] Chat history loads quickly
- [ ] Emoji picker responsive
- [ ] Notifications work on all platforms
- [ ] Profanity filter 99% effective

---

### Step 3.7: PWA & Performance [P3-3-07]

#### Overview
Convert the application to a Progressive Web App with offline capabilities and optimal performance.

#### Division of Labor

**Claude Code Tasks:**
1. **Service Worker**
   - Cache strategy implementation
   - Background sync logic
   - Update mechanisms
   - Offline fallbacks

2. **Performance Optimization**
   - Code splitting strategy
   - Lazy loading logic
   - Memory management
   - Bundle optimization

**Replit Agent Tasks:**
1. **PWA Setup**
   - Manifest file creation
   - Icon generation
   - Splash screens
   - Install prompts

2. **UI Optimizations**
   - Skeleton screens
   - Progressive enhancement
   - Smooth scrolling
   - Touch optimizations

#### Implementation Steps

1. **PWA Foundation** (Both)
   ```typescript
   // Claude: Service worker with game-specific caching
   self.addEventListener('fetch', (event) => {
     // Cache game assets, API calls
     // Implement offline queue for actions
   });
   ```

2. **Offline Support** (Claude)
   - Queue actions when offline
   - Sync when connection restored
   - Cache critical game data
   - Provide offline game modes

3. **Performance** (Both)
   - Claude: Implement route-based code splitting
   - Replit: Add loading indicators
   - Claude: Optimize WebSocket reconnection
   - Replit: Implement virtual lists

4. **Installation** (Replit)
   - Custom install banner
   - Platform-specific instructions
   - Update notifications
   - Version management UI

#### Success Criteria
- [ ] Lighthouse PWA score >90
- [ ] Works offline for basic features
- [ ] Installs on all platforms
- [ ] First paint <3 seconds
- [ ] 60fps scrolling performance

---

### Step 3.8: AI Integration & Offline [P3-3-08]

#### Overview
Integrate AI-generated content display and enhance offline capabilities with local AI fallbacks.

#### Division of Labor

**Claude Code Tasks:**
1. **AI Content Integration**
   - Content generation API calls
   - Response caching
   - Fallback mechanisms
   - Content validation

2. **Offline AI**
   - Local LLM integration
   - Reduced model loading
   - Offline quest generation
   - Local NPC dialogue

**Replit Agent Tasks:**
1. **AI Content Display**
   - Dynamic text rendering
   - Typewriter effects
   - Lore presentation
   - Loading states

2. **Offline UI**
   - Offline mode indicators
   - Feature availability
   - Sync status display
   - Data usage warnings

#### Implementation Steps

1. **AI Integration** (Claude)
   ```typescript
   interface AIContentService {
     generateQuestText(parameters: QuestParams): Promise<string>;
     generateNPCDialogue(context: DialogueContext): Promise<string[]>;
     getCachedContent(key: string): string | null;
     validateContent(text: string): boolean;
   }
   ```

2. **Content Display** (Replit)
   - Smooth text reveal animations
   - Dynamic layout for varying content
   - Rich text formatting support
   - Accessibility considerations

3. **Offline Fallbacks** (Claude)
   - Load compressed local model
   - Implement basic generation
   - Cache frequently used content
   - Gradual quality degradation

4. **Sync Management** (Both)
   - Claude: Track offline changes
   - Replit: Sync progress UI
   - Claude: Conflict resolution
   - Replit: Manual sync controls

#### Success Criteria
- [ ] AI content loads <2 seconds
- [ ] Offline mode functional
- [ ] Local generation works
- [ ] Smooth content transitions
- [ ] Clear offline indicators

---

### Step 3.9: Account Management Interface [P3-3-09]

#### Overview
Create a comprehensive account management system with security features and mobile optimization.

#### Division of Labor

**Claude Code Tasks:**
1. **Account Security**
   - Password change logic
   - Session management
   - 2FA implementation
   - Security audit logs

2. **Privacy Controls**
   - Data export functionality
   - Account deletion logic
   - Privacy settings API
   - GDPR compliance

**Replit Agent Tasks:**
1. **Account UI**
   - Settings panel layout
   - Form validations
   - Session list display
   - Security indicators

2. **Mobile Optimization**
   - Touch-friendly forms
   - Responsive layouts
   - Native keyboard handling
   - Biometric integration

#### Implementation Steps

1. **Security Foundation** (Claude)
   ```typescript
   interface AccountService {
     changePassword(current: string, new: string): Promise<void>;
     enableTwoFactor(): Promise<QRCode>;
     terminateSession(sessionId: string): Promise<void>;
     exportUserData(): Promise<UserDataExport>;
   }
   ```

2. **Account Interface** (Replit)
   - Tabbed settings layout
   - Password strength indicator
   - 2FA setup wizard
   - Active session management

3. **Privacy Features** (Both)
   - Claude: GDPR-compliant data export
   - Replit: Download progress UI
   - Claude: Secure account deletion
   - Replit: Confirmation workflows

4. **Mobile Security** (Both)
   - Claude: Biometric auth API
   - Replit: Fingerprint/Face ID UI
   - Claude: Device trust system
   - Replit: Security status badges

#### Success Criteria
- [ ] Password changes instant
- [ ] 2FA setup <2 minutes
- [ ] Data export complete
- [ ] Biometric login works
- [ ] GDPR compliant

---

## Phase 4: Advanced Features (Weeks 7-8)

### Step 4.1: Advanced Combat Systems [P4-4-01]

#### Overview
Enhance combat with abilities, cooldowns, and complex battle mechanics including buffs/debuffs.

#### Division of Labor

**Claude Code Tasks:**
1. **Ability System**
   - Ability execution engine
   - Cooldown tracking system
   - Resource cost calculations
   - Ability queue management

2. **Combat Mechanics**
   - Buff/debuff state machine
   - Damage type calculations
   - Resistance computations
   - Threat generation logic

**Replit Agent Tasks:**
1. **Ability UI**
   - Ability bar interface
   - Cooldown visualizations
   - Resource cost display
   - Queue indicators

2. **Status Effects UI**
   - Buff/debuff icons
   - Duration timers
   - Stack counters
   - Effect tooltips

#### Implementation Steps

1. **Ability Framework** (Claude)
   ```typescript
   interface AbilitySystem {
     executeAbility(ability: Ability, target: Target): Promise<AbilityResult>;
     calculateCooldown(ability: Ability, character: Character): number;
     validateResources(ability: Ability, character: Character): boolean;
     queueAbility(ability: Ability): void;
   }
   ```

2. **Visual Systems** (Replit)
   - Radial cooldown overlays
   - Resource bar integration
   - Ability highlighting
   - Cast time progress bars

3. **Status Management** (Both)
   - Claude: Effect stacking rules
   - Replit: Icon organization
   - Claude: Duration calculations
   - Replit: Timer displays

4. **Advanced Mechanics** (Claude)
   - Damage mitigation formulas
   - Threat table management
   - Crowd control diminishing returns
   - Combo system implementation

#### Success Criteria
- [ ] 30+ unique abilities
- [ ] Smooth cooldown animations
- [ ] <50ms ability execution
- [ ] Accurate threat calculations
- [ ] No ability queue bugs

---

### Step 4.2: Title & Achievement Systems [P4-4-02]

#### Overview
Implement comprehensive title and achievement systems with progression tracking and rewards.

#### Division of Labor

**Claude Code Tasks:**
1. **Title System**
   - Title unlock conditions
   - Title effect calculations
   - Database management
   - Progress tracking

2. **Achievement Engine**
   - Achievement detection
   - Progress calculations
   - Reward distribution
   - Point system

**Replit Agent Tasks:**
1. **Title UI**
   - Title selection interface
   - Title display options
   - Preview system
   - Unlock notifications

2. **Achievement UI**
   - Achievement browser
   - Progress bars
   - Category navigation
   - Reward displays

#### Implementation Steps

1. **Title Foundation** (Claude)
   ```typescript
   interface TitleService {
     checkTitleUnlock(character: Character, action: GameAction): Title[];
     applyTitleEffects(character: Character, title: Title): void;
     getTitleProgress(character: Character): TitleProgress[];
   }
   ```

2. **Achievement System** (Claude)
   - Event-based detection
   - Incremental progress tracking
   - Retroactive unlock checks
   - Reward queue system

3. **Display Systems** (Replit)
   - Title showcase interface
   - Achievement grid layout
   - Progress visualizations
   - Unlock animations

4. **Integration** (Both)
   - Claude: Real-time unlock detection
   - Replit: Toast notifications
   - Claude: Leaderboard calculations
   - Replit: Ranking displays

#### Success Criteria
- [ ] 100+ achievements
- [ ] 50+ unique titles
- [ ] Real-time unlocks
- [ ] Progress saves correctly
- [ ] Rewards distribute properly

---

### Step 4.3: Event & Time Systems [P4-4-03]

#### Overview
Create dynamic event system with scheduled events, seasonal content, and time-based mechanics.

#### Division of Labor

**Claude Code Tasks:**
1. **Event Framework**
   - Event scheduling engine
   - Condition checking
   - Reward calculations
   - Participation tracking

2. **Time Systems**
   - Server time sync
   - Reset calculations
   - Bonus period logic
   - Calendar management

**Replit Agent Tasks:**
1. **Event UI**
   - Event calendar view
   - Active event displays
   - Progress trackers
   - Countdown timers

2. **Time Displays**
   - Server time widget
   - Reset countdowns
   - Bonus indicators
   - Schedule views

#### Implementation Steps

1. **Event Engine** (Claude)
   ```typescript
   interface EventSystem {
     scheduleEvent(event: GameEvent): void;
     checkEventConditions(): ActiveEvent[];
     calculateEventRewards(participation: Participation): Rewards;
     getEventCalendar(days: number): CalendarEvent[];
   }
   ```

2. **Time Management** (Claude)
   - Cron-based scheduling
   - Timezone handling
   - Daily/weekly reset logic
   - Special period detection

3. **Event Interface** (Replit)
   - Interactive calendar
   - Event detail panels
   - Progress indicators
   - Leaderboard integration

4. **Notifications** (Both)
   - Claude: Event start/end detection
   - Replit: Push notifications
   - Claude: Reminder system
   - Replit: In-game alerts

#### Success Criteria
- [ ] Events start on time
- [ ] Accurate countdowns
- [ ] Seasonal events work
- [ ] Time zones handled
- [ ] No scheduling conflicts

---

### Step 4.4: Economy & Trading [P4-4-04]

#### Overview
Implement vendor systems and secure player-to-player trading with economic balancing.

#### Division of Labor

**Claude Code Tasks:**
1. **Vendor System**
   - Dynamic pricing algorithms
   - Stock management
   - Reputation calculations
   - Economic modeling

2. **Trading Engine**
   - Trade validation
   - Security checks
   - Transaction logging
   - Rollback capability

**Replit Agent Tasks:**
1. **Vendor UI**
   - Shop interface
   - Item browsing
   - Price displays
   - Purchase confirmations

2. **Trading UI**
   - Trade window design
   - Item placement
   - Confirmation flow
   - Trade history view

#### Implementation Steps

1. **Vendor Framework** (Claude)
   ```typescript
   interface VendorService {
     calculatePrice(item: Item, vendor: Vendor, buyer: Character): number;
     checkStock(vendor: Vendor, item: Item): number;
     applyReputation(price: number, reputation: number): number;
     refreshStock(vendor: Vendor): void;
   }
   ```

2. **Trading System** (Claude)
   - Secure trade sessions
   - Both-party confirmation
   - Atomic transactions
   - Anti-scam measures

3. **Economic Features** (Both)
   - Claude: Supply/demand modeling
   - Replit: Price trend graphs
   - Claude: Inflation controls
   - Replit: Economic dashboards

4. **User Experience** (Replit)
   - Intuitive trade flow
   - Clear value indicators
   - Trade suggestions
   - Quick trade templates

#### Success Criteria
- [ ] Trades execute atomically
- [ ] No item duplication
- [ ] Dynamic pricing works
- [ ] Reputation affects prices
- [ ] Economic balance maintained

---

### Step 4.5: Auction House & Market [P4-4-05]

#### Overview
Build a comprehensive marketplace system with auctions, buyouts, and market analytics.

#### Division of Labor

**Claude Code Tasks:**
1. **Auction Engine**
   - Bid processing
   - Auction timing
   - Winner determination
   - Fee calculations

2. **Market Analytics**
   - Price history tracking
   - Trend analysis
   - Market manipulation detection
   - Economic reports

**Replit Agent Tasks:**
1. **Marketplace UI**
   - Listing browser
   - Search interface
   - Filter system
   - Bid placement

2. **Analytics UI**
   - Price charts
   - Market trends
   - Hot items
   - Profit calculator

#### Implementation Steps

1. **Auction System** (Claude)
   ```typescript
   interface AuctionHouse {
     createListing(item: Item, params: AuctionParams): Listing;
     placeBid(listing: Listing, bid: Bid): BidResult;
     processExpiredAuctions(): void;
     calculateFees(sale: Sale): Fees;
   }
   ```

2. **Search & Discovery** (Both)
   - Claude: Full-text search engine
   - Replit: Advanced filter UI
   - Claude: Recommendation algorithm
   - Replit: Suggested items display

3. **Market Intelligence** (Claude)
   - Historical data aggregation
   - Moving average calculations
   - Arbitrage opportunity detection
   - Market report generation

4. **User Features** (Replit)
   - Watchlist functionality
   - Price alerts
   - Bulk listing tools
   - Sales history

#### Success Criteria
- [ ] <100ms search results
- [ ] Accurate price history
- [ ] No auction exploits
- [ ] Market data updated live
- [ ] Fees calculated correctly

---

### Step 4.6: Guild Systems [P4-4-06]

#### Overview
Implement comprehensive guild features including management, events, and progression systems.

#### Division of Labor

**Claude Code Tasks:**
1. **Guild Core**
   - Member management
   - Permission system
   - Guild progression
   - Activity tracking

2. **Guild Features**
   - Bank security
   - Event scheduling
   - Buff calculations
   - Territory logic

**Replit Agent Tasks:**
1. **Guild UI**
   - Member roster
   - Rank management
   - Guild bank interface
   - Activity feed

2. **Guild Events UI**
   - Event calendar
   - Signup sheets
   - Competition brackets
   - Territory map

#### Implementation Steps

1. **Guild Foundation** (Claude)
   ```typescript
   interface GuildService {
     createGuild(founder: Character, params: GuildParams): Guild;
     manageMember(action: MemberAction): Promise<void>;
     checkPermission(member: GuildMember, action: string): boolean;
     calculateGuildBuffs(guild: Guild): Buff[];
   }
   ```

2. **Management Tools** (Replit)
   - Hierarchical rank system
   - Permission matrix UI
   - Member action logs
   - Guild statistics

3. **Guild Banking** (Both)
   - Claude: Withdrawal limits
   - Replit: Tab organization
   - Claude: Audit logging
   - Replit: Transaction history

4. **Guild Events** (Both)
   - Claude: Event point calculations
   - Replit: Leaderboard displays
   - Claude: Reward distribution
   - Replit: Event announcements

#### Success Criteria
- [ ] Supports 500+ members
- [ ] Permission system secure
- [ ] Guild bank protected
- [ ] Events run smoothly
- [ ] Territory system works

---

### Step 4.7: Communication & Social [P4-4-07]

#### Overview
Enhance communication with mail system and group finding tools for better social interaction.

#### Division of Labor

**Claude Code Tasks:**
1. **Mail System**
   - Message delivery
   - Attachment handling
   - COD calculations
   - Expiration logic

2. **LFG System**
   - Matching algorithm
   - Group composition
   - Role validation
   - Queue management

**Replit Agent Tasks:**
1. **Mail UI**
   - Inbox interface
   - Compose window
   - Attachment slots
   - COD settings

2. **LFG UI**
   - Activity browser
   - Role selector
   - Group builder
   - Queue status

#### Implementation Steps

1. **Mail Service** (Claude)
   ```typescript
   interface MailService {
     sendMail(mail: Mail): Promise<void>;
     processAttachments(attachments: Attachment[]): void;
     handleCOD(mail: Mail, payment: Payment): void;
     expireMail(): void;
   }
   ```

2. **Mail Interface** (Replit)
   - Tabbed inbox/sent/drafts
   - Rich text editor
   - Drag-drop attachments
   - Quick reply options

3. **Group Finder** (Claude)
   - Smart matching based on gear/level
   - Role requirement checking
   - Cross-realm capabilities
   - Rating systems

4. **Social Features** (Replit)
   - Player profiles
   - Achievement showcases
   - Friend suggestions
   - Social feed

#### Success Criteria
- [ ] Mail delivers instantly
- [ ] COD system secure
- [ ] LFG matches quickly
- [ ] Groups form properly
- [ ] No lost attachments

---

### Step 4.8: Admin Foundation [P4-4-08]

#### Overview
Build administrative infrastructure for game management and player support.

#### Division of Labor

**Claude Code Tasks:**
1. **Admin Core**
   - Permission framework
   - Audit logging system
   - Admin API endpoints
   - Security measures

2. **Player Management**
   - Ban/suspension logic
   - Warning system
   - Account modifications
   - Investigation tools

**Replit Agent Tasks:**
1. **Admin Interface**
   - Dashboard layout
   - Search interfaces
   - Action panels
   - Log viewers

2. **Moderation UI**
   - Player profiles
   - Action buttons
   - Report queues
   - Quick actions

#### Implementation Steps

1. **Admin Framework** (Claude)
   ```typescript
   interface AdminService {
     checkAdminAuth(user: User, action: AdminAction): boolean;
     logAdminAction(action: AdminAction): void;
     executeAdminCommand(command: Command): Promise<Result>;
     searchPlayers(criteria: SearchCriteria): Player[];
   }
   ```

2. **Security Layer** (Claude)
   - Multi-factor admin auth
   - IP restrictions
   - Action rate limiting
   - Audit trail encryption

3. **Admin Tools** (Replit)
   - Powerful search filters
   - Bulk action support
   - Real-time monitoring
   - Report generation

4. **Player Actions** (Both)
   - Claude: Safe account modifications
   - Replit: Confirmation dialogs
   - Claude: Rollback capabilities
   - Replit: Action history view

#### Success Criteria
- [ ] All actions logged
- [ ] No unauthorized access
- [ ] Quick player lookup
- [ ] Audit trail complete
- [ ] Rollback works

---

### Step 4.9: PvP & Moderation [P4-4-09]

#### Overview
Implement PvP arena system with matchmaking and comprehensive player safety features.

#### Division of Labor

**Claude Code Tasks:**
1. **PvP Systems**
   - Matchmaking algorithm
   - ELO calculations
   - Season management
   - Combat modifications

2. **Safety Systems**
   - Report processing
   - Toxicity detection
   - Auto-moderation
   - Penalty application

**Replit Agent Tasks:**
1. **Arena UI**
   - Queue interface
   - Match display
   - Leaderboards
   - Season rewards

2. **Safety UI**
   - Report forms
   - Block lists
   - Chat filters
   - Safety settings

#### Implementation Steps

1. **PvP Foundation** (Claude)
   ```typescript
   interface PvPService {
     findMatch(player: Player): Promise<Match>;
     calculateELO(winner: Player, loser: Player): ELOChange;
     processSeasonEnd(): Promise<Rewards[]>;
     enableSpectatorMode(match: Match): void;
   }
   ```

2. **Matchmaking** (Claude)
   - Skill-based matching
   - Queue time optimization
   - Fair team composition
   - Smurf detection

3. **Arena Interface** (Replit)
   - Queue countdown
   - Ready check system
   - Combat modifications UI
   - Post-match statistics

4. **Player Safety** (Both)
   - Claude: AI-powered chat analysis
   - Replit: Report categories
   - Claude: Automatic penalties
   - Replit: Appeal interface

#### Success Criteria
- [ ] Fair matchmaking
- [ ] <30s queue times
- [ ] Accurate ELO
- [ ] Toxicity reduced 90%
- [ ] Quick report handling

---

## Phase 5: Content & Polish (Weeks 9-10)

### Step 5.1: Race & Starting Content [P5-5-01]

#### Overview
Create unique starting experiences for each race with custom zones and storylines.

#### Division of Labor

**Claude Code Tasks:**
1. **Race Systems**
   - Racial ability implementation
   - Stat modifier calculations
   - Starting equipment assignment
   - Zone assignment logic

2. **Content Generation**
   - Dynamic quest generation
   - NPC dialogue variation
   - Environmental descriptions
   - Lore consistency

**Replit Agent Tasks:**
1. **Race Selection UI**
   - Character creator updates
   - Race preview system
   - Ability descriptions
   - Starting zone previews

2. **Zone Visuals**
   - Zone-specific UI themes
   - Environmental indicators
   - Cultural UI elements
   - Race-specific icons

#### Implementation Steps

1. **Race Framework** (Claude)
   ```typescript
   interface RaceSystem {
     getRacialAbilities(race: Race): Ability[];
     calculateRacialMods(race: Race, stats: BaseStats): Stats;
     assignStartingZone(race: Race): Zone;
     generateRaceQuests(race: Race): Quest[];
   }
   ```

2. **Starting Experience** (Both)
   - Claude: Zone-specific spawn points
   - Replit: Custom welcome screens
   - Claude: Race-specific NPCs
   - Replit: Cultural UI elements

3. **Content Creation** (Claude)
   - 8 unique starting zones
   - 20+ quests per zone
   - Race-specific storylines
   - Cultural flavor text

4. **Polish** (Replit)
   - Smooth transitions
   - Atmospheric audio cues
   - Visual storytelling
   - Intuitive zone navigation

#### Success Criteria
- [ ] 8 complete zones
- [ ] Unique racial feels
- [ ] Balanced progression
- [ ] Rich storytelling
- [ ] No content gaps

---

### Step 5.2: Advanced NPC & AI [P5-5-02]

#### Overview
Enhance NPCs with dynamic behaviors and create challenging monster variations.

#### Division of Labor

**Claude Code Tasks:**
1. **NPC AI Enhancement**
   - Behavior tree implementation
   - Schedule system
   - Context-aware responses
   - Faction relationships

2. **Monster Variations**
   - Elite monster logic
   - Rare spawn system
   - World boss mechanics
   - Difficulty scaling

**Replit Agent Tasks:**
1. **NPC Indicators**
   - Schedule displays
   - Mood indicators
   - Faction markers
   - Quest availability

2. **Monster UI**
   - Elite frames
   - Threat indicators
   - Special ability warnings
   - Health percentages

#### Implementation Steps

1. **Advanced AI** (Claude)
   ```typescript
   interface AdvancedNPCAI {
     updateBehavior(npc: NPC, context: WorldContext): Behavior;
     generateDynamicDialogue(npc: NPC, player: Player): Dialogue;
     calculateFactionStanding(player: Player, faction: Faction): Standing;
     scheduleNPCActivities(npc: NPC): Schedule;
   }
   ```

2. **Monster System** (Claude)
   - Tiered difficulty system
   - Special ability sets
   - Loot table modifications
   - Spawn condition checking

3. **Visual Feedback** (Replit)
   - Elite monster glows
   - Rare spawn notifications
   - Boss approach warnings
   - Ability telegraphs

4. **World Integration** (Both)
   - Claude: Dynamic spawn locations
   - Replit: Minimap indicators
   - Claude: Patrol path generation
   - Replit: Path visualizations

#### Success Criteria
- [ ] NPCs feel alive
- [ ] Elite combat challenging
- [ ] Rare spawns exciting
- [ ] Boss fights epic
- [ ] AI behaviors varied

---

### Step 5.3: Quest & Story Systems [P5-5-03]

#### Overview
Implement comprehensive quest framework with branching narratives and AI-generated content.

#### Division of Labor

**Claude Code Tasks:**
1. **Quest Engine**
   - Quest state management
   - Prerequisite checking
   - Reward calculations
   - Chain progression

2. **AI Content**
   - Dynamic quest text
   - Procedural objectives
   - Lore generation
   - Story consistency

**Replit Agent Tasks:**
1. **Quest UI**
   - Quest log interface
   - Objective tracking
   - Map integration
   - Dialogue choices

2. **Story Display**
   - Cutscene system
   - Dialogue animations
   - Choice interfaces
   - Quest markers

#### Implementation Steps

1. **Quest Framework** (Claude)
   ```typescript
   interface QuestSystem {
     startQuest(quest: Quest, player: Player): void;
     updateObjective(objective: Objective, progress: Progress): void;
     checkPrerequisites(quest: Quest, player: Player): boolean;
     generateProceduralQuest(params: QuestParams): Quest;
   }
   ```

2. **Narrative System** (Both)
   - Claude: Branching logic engine
   - Replit: Choice UI system
   - Claude: Consequence tracking
   - Replit: Story recap displays

3. **AI Integration** (Claude)
   - Context-aware generation
   - Lore consistency checking
   - Dynamic NPC responses
   - Procedural side quests

4. **Polish** (Replit)
   - Quest start animations
   - Objective notifications
   - Completion celebrations
   - Story journal

#### Success Criteria
- [ ] 200+ unique quests
- [ ] Branching works properly
- [ ] AI content coherent
- [ ] Objectives track correctly
- [ ] Rewards distribute properly

---

### Step 5.4: Crafting & Gathering [P5-5-04]

#### Overview
Create deep crafting and gathering systems with progression and specialization paths.

#### Division of Labor

**Claude Code Tasks:**
1. **Crafting Logic**
   - Recipe validation
   - Quality calculations
   - Specialization bonuses
   - Discovery system

2. **Gathering System**
   - Node spawn logic
   - Resource distribution
   - Skill requirements
   - Rare material chances

**Replit Agent Tasks:**
1. **Crafting UI**
   - Recipe browser
   - Crafting queue
   - Progress bars
   - Discovery notifications

2. **Gathering UI**
   - Node indicators
   - Gathering progress
   - Skill displays
   - Resource tracking

#### Implementation Steps

1. **Crafting Foundation** (Claude)
   ```typescript
   interface CraftingSystem {
     craftItem(recipe: Recipe, materials: Material[]): CraftResult;
     calculateQuality(crafter: Character, recipe: Recipe): Quality;
     discoverRecipe(character: Character, hint: CraftingHint): Recipe;
     applySpecialization(result: CraftResult, spec: Specialization): void;
   }
   ```

2. **Gathering Mechanics** (Claude)
   - Node respawn timers
   - Skill-based success rates
   - Bonus material chances
   - Tool durability effects

3. **User Experience** (Replit)
   - Intuitive recipe search
   - Material requirement display
   - Queue management
   - Batch crafting options

4. **Progression** (Both)
   - Claude: Skill point calculations
   - Replit: Skill tree UI
   - Claude: Specialization unlocks
   - Replit: Achievement displays

#### Success Criteria
- [ ] 10+ crafting professions
- [ ] 500+ recipes
- [ ] Gathering feels rewarding
- [ ] Specializations meaningful
- [ ] Economy balanced

---

### Step 5.5: World Events & Dynamics [P5-5-05]

#### Overview
Implement dynamic world events that respond to player actions and create emergent gameplay.

#### Division of Labor

**Claude Code Tasks:**
1. **Event System**
   - Event trigger conditions
   - Scaling algorithms
   - Reward distribution
   - Chain reactions

2. **AI Generation**
   - Procedural event creation
   - Variety algorithms
   - Player impact tracking
   - Story coherence

**Replit Agent Tasks:**
1. **Event UI**
   - Event notifications
   - Progress tracking
   - Contribution display
   - Reward previews

2. **World Changes**
   - Environmental updates
   - Event indicators
   - Map overlays
   - Status displays

#### Implementation Steps

1. **Event Engine** (Claude)
   ```typescript
   interface WorldEventSystem {
     triggerEvent(trigger: EventTrigger): WorldEvent;
     scaleEvent(event: WorldEvent, participants: number): void;
     calculateContribution(player: Player, event: WorldEvent): Contribution;
     generateDynamicEvent(context: WorldState): WorldEvent;
   }
   ```

2. **Dynamic Scaling** (Claude)
   - Participant counting
   - Difficulty adjustment
   - Reward scaling
   - Performance optimization

3. **Visual Impact** (Replit)
   - Event area highlights
   - Progress indicators
   - Leaderboard displays
   - Environmental effects

4. **Player Agency** (Both)
   - Claude: Choice consequences
   - Replit: Decision interfaces
   - Claude: World state changes
   - Replit: Change visualizations

#### Success Criteria
- [ ] Events scale smoothly
- [ ] Variety maintained
- [ ] Performance stable
- [ ] Rewards fair
- [ ] World feels alive

---

### Step 5.6: Environmental Systems [P5-5-06]

#### Overview
Add environmental depth with day/night cycles, weather, and fast travel systems.

#### Division of Labor

**Claude Code Tasks:**
1. **Time Systems**
   - Day/night calculations
   - Weather generation
   - Season progression
   - Environmental hazards

2. **Travel System**
   - Waypoint unlocking
   - Mount mechanics
   - Travel cost calculations
   - Discovery rewards

**Replit Agent Tasks:**
1. **Environmental UI**
   - Time displays
   - Weather effects
   - Season indicators
   - Hazard warnings

2. **Travel UI**
   - Map interface
   - Waypoint system
   - Mount selection
   - Travel progress

#### Implementation Steps

1. **Environmental Engine** (Claude)
   ```typescript
   interface EnvironmentSystem {
     updateTimeOfDay(): TimeState;
     generateWeather(zone: Zone): Weather;
     checkSeasonalEvents(): SeasonalEvent[];
     applyEnvironmentalEffects(character: Character): Effect[];
   }
   ```

2. **Visual Systems** (Replit)
   - Lighting transitions
   - Weather particles
   - Seasonal textures
   - Hazard indicators

3. **Fast Travel** (Both)
   - Claude: Unlock conditions
   - Replit: Interactive map
   - Claude: Cost calculations
   - Replit: Travel animations

4. **Integration** (Both)
   - Claude: NPC schedule integration
   - Replit: Time-based UI changes
   - Claude: Weather combat effects
   - Replit: Environmental audio

#### Success Criteria
- [ ] Smooth day/night cycle
- [ ] Weather variety
- [ ] Seasons feel different
- [ ] Travel convenient
- [ ] Environmental immersion

---

### Step 5.7: Instance & Dungeon Systems [P5-5-07]

#### Overview
Create instanced content with dungeons, boss mechanics, and phasing technology.

#### Division of Labor

**Claude Code Tasks:**
1. **Instance Management**
   - Instance creation/destruction
   - Player assignment
   - State persistence
   - Reset mechanics

2. **Dungeon Mechanics**
   - Boss AI systems
   - Mechanic scripting
   - Loot distribution
   - Difficulty scaling

**Replit Agent Tasks:**
1. **Instance UI**
   - Group formation
   - Ready checks
   - Progress tracking
   - Loot displays

2. **Dungeon Features**
   - Boss health frames
   - Mechanic warnings
   - Phase transitions
   - Victory screens

#### Implementation Steps

1. **Instance Framework** (Claude)
   ```typescript
   interface InstanceSystem {
     createInstance(template: DungeonTemplate): Instance;
     assignPlayers(instance: Instance, group: Group): void;
     scriptBossMechanic(boss: Boss, mechanic: Mechanic): void;
     handleInstanceReset(instance: Instance): void;
   }
   ```

2. **Boss Encounters** (Claude)
   - Phase-based mechanics
   - Ability rotations
   - Enrage timers
   - Positional requirements

3. **Player Experience** (Replit)
   - Dungeon finder integration
   - Progress save points
   - Wipe recovery UI
   - Loot roll interface

4. **Phasing Tech** (Both)
   - Claude: Story instance creation
   - Replit: Seamless transitions
   - Claude: World state management
   - Replit: Phase indicators

#### Success Criteria
- [ ] Instances stable
- [ ] Boss fights engaging
- [ ] Loot distributed fairly
- [ ] Phases work smoothly
- [ ] Performance maintained

---

### Step 5.8: Admin Systems Advanced [P5-5-08]

#### Overview
Implement advanced administrative tools for live game management and configuration.

#### Division of Labor

**Claude Code Tasks:**
1. **Config Management**
   - Dynamic settings system
   - Hot-reload capabilities
   - Version control
   - Rollback functionality

2. **Monitoring Systems**
   - Real-time metrics
   - Performance tracking
   - Economic monitoring
   - Player behavior analysis

**Replit Agent Tasks:**
1. **Admin Dashboard**
   - Configuration editor
   - Metric visualizations
   - Alert management
   - Report generation

2. **Monitoring UI**
   - Live dashboards
   - Graph displays
   - Alert notifications
   - Drill-down views

#### Implementation Steps

1. **Configuration System** (Claude)
   ```typescript
   interface ConfigSystem {
     updateConfig(key: string, value: any): Promise<void>;
     hotReload(config: Config): void;
     validateConfig(config: Config): ValidationResult;
     rollbackConfig(version: number): Promise<void>;
   }
   ```

2. **Monitoring Infrastructure** (Claude)
   - Metric collection pipelines
   - Aggregation services
   - Alert thresholds
   - Predictive analysis

3. **Dashboard Creation** (Replit)
   - Responsive layouts
   - Real-time updates
   - Interactive charts
   - Export capabilities

4. **Integration** (Both)
   - Claude: WebSocket data streams
   - Replit: Live data rendering
   - Claude: Historical analysis
   - Replit: Trend visualizations

#### Success Criteria
- [ ] Configs update live
- [ ] Metrics accurate
- [ ] Dashboards responsive
- [ ] Alerts timely
- [ ] No config corruption

---

### Step 5.9: GM Tools & Commands [P5-5-09]

#### Overview
Create comprehensive Game Master tools for live support and event management.

#### Division of Labor

**Claude Code Tasks:**
1. **GM Commands**
   - Command parsing engine
   - Permission validation
   - Action execution
   - State manipulation

2. **Support Tools**
   - Player assistance
   - Item restoration
   - Character fixes
   - Investigation tools

**Replit Agent Tasks:**
1. **GM Interface**
   - Command console
   - Player inspector
   - Action panels
   - Template library

2. **Support UI**
   - Ticket system
   - Quick actions
   - Player history
   - Communication tools

#### Implementation Steps

1. **Command System** (Claude)
   ```typescript
   interface GMCommandSystem {
     parseCommand(input: string): Command;
     validatePermissions(gm: GM, command: Command): boolean;
     executeCommand(command: Command): Promise<Result>;
     logGMAction(action: GMAction): void;
   }
   ```

2. **GM Powers** (Claude)
   - Teleportation system
   - Item spawning
   - Character modification
   - Event triggering

3. **Support Interface** (Replit)
   - Integrated help desk
   - Macro system
   - Quick responses
   - Investigation tools

4. **Safety Measures** (Both)
   - Claude: Action limits
   - Replit: Confirmation dialogs
   - Claude: Audit logging
   - Replit: Rollback UI

#### Success Criteria
- [ ] Commands work reliably
- [ ] Permissions enforced
- [ ] Support efficient
- [ ] Actions logged
- [ ] No abuse possible

---

### Step 5.10: Balance & Polish [P5-5-10]

#### Overview
Final balance pass and polish to ensure smooth, engaging gameplay.

#### Division of Labor

**Claude Code Tasks:**
1. **Economic Balance**
   - Gold sink implementation
   - Inflation monitoring
   - Wealth distribution
   - Market stabilization

2. **Game Balance**
   - Combat formulas
   - Progression curves
   - Item power
   - Class balance

**Replit Agent Tasks:**
1. **Polish UI**
   - Animation timing
   - Transition smoothness
   - Feedback clarity
   - Visual consistency

2. **UX Improvements**
   - Tutorial refinement
   - Onboarding flow
   - Help integration
   - Accessibility

#### Implementation Steps

1. **Balance Framework** (Claude)
   ```typescript
   interface BalanceSystem {
     analyzeEconomy(): EconomicReport;
     adjustGoldSinks(params: SinkParams): void;
     balanceCombatFormulas(data: CombatData): Formulas;
     normalizeProgression(curve: ProgressionCurve): void;
   }
   ```

2. **Economic Controls** (Claude)
   - Vendor price adjustments
   - Repair cost scaling
   - Travel expense tuning
   - Auction house fees

3. **Polish Pass** (Replit)
   - Loading screen tips
   - Micro-interactions
   - Error message clarity
   - Success celebrations

4. **Final Testing** (Both)
   - Claude: Automated balance tests
   - Replit: User flow testing
   - Claude: Performance profiling
   - Replit: Device compatibility

#### Success Criteria
- [ ] Economy stable
- [ ] Classes balanced
- [ ] Progression smooth
- [ ] UI polished
- [ ] Game fun

---

## Phase 6: Testing & Launch (Weeks 11-12)

### Step 6.1: Test Infrastructure [P6-6-01]

#### Overview
Build comprehensive automated testing suite for all game systems.

#### Division of Labor

**Claude Code Tasks:**
1. **Test Framework**
   - Integration test setup
   - E2E test scenarios
   - Performance benchmarks
   - Load generators

2. **Test Coverage**
   - API endpoint tests
   - Service layer tests
   - Socket.IO tests
   - Database tests

**Replit Agent Tasks:**
1. **Test UI**
   - Test runner interface
   - Coverage reports
   - Performance graphs
   - Failure analysis

2. **Test Tools**
   - Visual regression tests
   - Accessibility tests
   - Device testing
   - Browser matrix

#### Implementation Steps

1. **Test Architecture** (Claude)
   ```typescript
   interface TestFramework {
     runIntegrationSuite(): TestResults;
     generateLoadTest(scenario: LoadScenario): void;
     benchmarkPerformance(operation: Operation): Metrics;
     validateGameState(state: GameState): Validation;
   }
   ```

2. **Automated Testing** (Claude)
   - Combat simulation tests
   - Economic model tests
   - Quest progression tests
   - PvP balance tests

3. **Coverage Analysis** (Both)
   - Claude: Code coverage tracking
   - Replit: Coverage visualization
   - Claude: Missing test detection
   - Replit: Report generation

4. **Continuous Testing** (Both)
   - Claude: CI/CD pipeline
   - Replit: Status dashboards
   - Claude: Regression detection
   - Replit: Failure notifications

#### Success Criteria
- [ ] 80%+ code coverage
- [ ] All systems tested
- [ ] Performance tracked
- [ ] Regressions caught
- [ ] CI/CD working

---

### Step 6.2: Load & Stress Testing [P6-6-02]

#### Overview
Ensure system stability under extreme load conditions.

#### Division of Labor

**Claude Code Tasks:**
1. **Load Testing**
   - User simulation
   - Scenario creation
   - Bottleneck detection
   - Resource monitoring

2. **Stress Testing**
   - Breaking point tests
   - Recovery testing
   - Cascade failure prevention
   - Memory leak detection

**Replit Agent Tasks:**
1. **Monitoring UI**
   - Real-time metrics
   - Load visualizations
   - Alert displays
   - Historical analysis

2. **Test Controls**
   - Load adjustment
   - Scenario selection
   - Test scheduling
   - Report generation

#### Implementation Steps

1. **Load Framework** (Claude)
   ```typescript
   interface LoadTestSystem {
     simulateUsers(count: number, behavior: UserBehavior): void;
     measureResponseTimes(): ResponseMetrics;
     identifyBottlenecks(): Bottleneck[];
     testFailover(): FailoverResult;
   }
   ```

2. **Stress Scenarios** (Claude)
   - Mass login events
   - World event participation
   - Market manipulation attempts
   - Chat spam floods

3. **Monitoring Setup** (Both)
   - Claude: Metric collection
   - Replit: Dashboard creation
   - Claude: Alert thresholds
   - Replit: Visual alerts

4. **Optimization** (Claude)
   - Query optimization
   - Caching strategies
   - Connection pooling
   - Load balancing

#### Success Criteria
- [ ] 10k concurrent users
- [ ] <200ms response time
- [ ] No memory leaks
- [ ] Graceful degradation
- [ ] Auto-scaling works

---

### Step 6.3: Content Testing [P6-6-03]

#### Overview
Validate all game content for balance, progression, and quality.

#### Division of Labor

**Claude Code Tasks:**
1. **Balance Testing**
   - Progression analysis
   - Combat simulations
   - Economic modeling
   - Reward validation

2. **AI Testing**
   - Content quality checks
   - Variety analysis
   - Coherence validation
   - Performance impact

**Replit Agent Tasks:**
1. **Content Tools**
   - Test character creation
   - Progression tracking
   - Content browsers
   - Issue reporting

2. **QA Interface**
   - Bug report forms
   - Screenshot tools
   - Video capture
   - Annotation system

#### Implementation Steps

1. **Content Validation** (Claude)
   ```typescript
   interface ContentTestSystem {
     validateProgression(character: TestCharacter): ProgressionReport;
     simulateCombat(parties: Party[]): CombatAnalysis;
     analyzeEconomy(duration: number): EconomicReport;
     checkAIContent(samples: number): QualityReport;
   }
   ```

2. **Automated Checks** (Claude)
   - Quest completion paths
   - Item drop rates
   - XP curve validation
   - Gold acquisition rates

3. **Manual Testing** (Replit)
   - Tester assignment UI
   - Progress tracking
   - Issue categorization
   - Priority setting

4. **Feedback Loop** (Both)
   - Claude: Issue aggregation
   - Replit: Developer dashboard
   - Claude: Auto-fix suggestions
   - Replit: Fix verification

#### Success Criteria
- [ ] Balanced progression
- [ ] No content gaps
- [ ] AI content quality high
- [ ] All quests completable
- [ ] Economy sustainable

---

### Step 6.4: Security & Anti-Cheat [P6-6-04]

#### Overview
Harden security and implement comprehensive anti-cheat systems.

#### Division of Labor

**Claude Code Tasks:**
1. **Security Hardening**
   - Exploit prevention
   - Input sanitization
   - Rate limiting
   - Encryption

2. **Anti-Cheat Engine**
   - Behavior analysis
   - Statistical detection
   - Pattern recognition
   - Action validation

**Replit Agent Tasks:**
1. **Security UI**
   - Admin alerts
   - Violation logs
   - Player reports
   - Appeal system

2. **Monitoring Tools**
   - Suspicious activity
   - Real-time alerts
   - Investigation UI
   - Ban management

#### Implementation Steps

1. **Security Framework** (Claude)
   ```typescript
   interface SecuritySystem {
     validateAction(action: PlayerAction): ValidationResult;
     detectAnomalies(player: Player): Anomaly[];
     preventExploit(exploit: ExploitAttempt): void;
     encryptSensitiveData(data: any): EncryptedData;
   }
   ```

2. **Anti-Cheat Measures** (Claude)
   - Speed hack detection
   - Packet tampering prevention
   - Item duplication checks
   - Bot behavior detection

3. **Admin Security** (Both)
   - Claude: Permission validation
   - Replit: 2FA interface
   - Claude: Audit trails
   - Replit: Alert dashboards

4. **Player Protection** (Both)
   - Claude: Account security
   - Replit: Security settings
   - Claude: Session management
   - Replit: Device management

#### Success Criteria
- [ ] No exploits possible
- [ ] Cheaters detected
- [ ] Admin tools secure
- [ ] Player data safe
- [ ] Quick ban process

---

### Step 6.5: Beta Program [P6-6-05]

#### Overview
Run comprehensive beta testing program with real players.

#### Division of Labor

**Claude Code Tasks:**
1. **Beta Infrastructure**
   - Beta server setup
   - Data isolation
   - Progress tracking
   - Feedback collection

2. **Beta Features**
   - Limited access control
   - Progress wipe system
   - Reward tracking
   - Analytics collection

**Replit Agent Tasks:**
1. **Beta UI**
   - Application system
   - Feedback forms
   - Bug reporting
   - Forums integration

2. **Beta Tools**
   - Progress displays
   - Reward tracking
   - Event calendar
   - Communication hub

#### Implementation Steps

1. **Beta Framework** (Claude)
   ```typescript
   interface BetaSystem {
     manageBetaAccess(player: Player): BetaAccess;
     collectFeedback(feedback: Feedback): void;
     trackBetaProgress(player: Player): Progress;
     distributeBetaRewards(player: Player): Rewards;
   }
   ```

2. **Testing Waves** (Claude)
   - Phased rollout system
   - Load increase management
   - Feature flag control
   - Data collection

3. **Feedback Systems** (Both)
   - Claude: Feedback categorization
   - Replit: Submission forms
   - Claude: Sentiment analysis
   - Replit: Response tracking

4. **Beta Events** (Both)
   - Claude: Special event scheduling
   - Replit: Event announcements
   - Claude: Stress test coordination
   - Replit: Participation tracking

#### Success Criteria
- [ ] Smooth beta launch
- [ ] Valuable feedback
- [ ] Issues identified
- [ ] Server stability
- [ ] Player satisfaction

---

### Step 6.6: Tutorial & Onboarding [P6-6-06]

#### Overview
Perfect the new player experience with comprehensive tutorials and onboarding.

#### Division of Labor

**Claude Code Tasks:**
1. **Tutorial Logic**
   - Progress tracking
   - Completion detection
   - Hint system
   - Adaptive difficulty

2. **Analytics**
   - Drop-off tracking
   - Completion rates
   - Time analysis
   - Confusion detection

**Replit Agent Tasks:**
1. **Tutorial UI**
   - Step indicators
   - Highlight system
   - Tooltip guidance
   - Progress display

2. **Onboarding Flow**
   - Welcome sequences
   - Feature introduction
   - Achievement guides
   - Social introduction

#### Implementation Steps

1. **Tutorial System** (Claude)
   ```typescript
   interface TutorialSystem {
     trackProgress(player: Player, step: TutorialStep): void;
     provideHint(player: Player, context: Context): Hint;
     analyzeDropoff(): DropoffReport;
     optimizeTutorial(data: TutorialData): Optimization;
   }
   ```

2. **Guided Experience** (Replit)
   - Interactive highlighting
   - Step-by-step guidance
   - Skip options
   - Review capabilities

3. **Analytics Integration** (Claude)
   - Funnel analysis
   - A/B testing framework
   - Heatmap generation
   - Conversion tracking

4. **Polish** (Both)
   - Claude: Adaptive hints
   - Replit: Smooth animations
   - Claude: Smart progression
   - Replit: Clear messaging

#### Success Criteria
- [ ] 90%+ completion rate
- [ ] <10min to basics
- [ ] Clear guidance
- [ ] Mobile optimized
- [ ] Engaging experience

---

### Step 6.7: Launch Infrastructure [P6-6-07]

#### Overview
Prepare production infrastructure for launch with scaling and monitoring.

#### Division of Labor

**Claude Code Tasks:**
1. **Infrastructure**
   - Auto-scaling setup
   - Load balancing
   - Database clustering
   - CDN configuration

2. **Monitoring**
   - Metric aggregation
   - Alert configuration
   - Log management
   - Performance tracking

**Replit Agent Tasks:**
1. **Operations UI**
   - Status dashboard
   - Deployment controls
   - Rollback interface
   - Alert management

2. **Admin Dashboards**
   - Real-time metrics
   - System health
   - Player analytics
   - Economic monitoring

#### Implementation Steps

1. **Scaling Setup** (Claude)
   ```typescript
   interface ScalingSystem {
     monitorLoad(): LoadMetrics;
     scaleServices(metrics: LoadMetrics): ScaleAction;
     balanceLoad(traffic: Traffic): Distribution;
     optimizeResources(): Optimization;
   }
   ```

2. **Deployment Pipeline** (Claude)
   - Blue-green deployment
   - Canary releases
   - Rollback procedures
   - Health checks

3. **Monitoring Stack** (Both)
   - Claude: Data collection
   - Replit: Visualization
   - Claude: Anomaly detection
   - Replit: Alert UI

4. **Admin Operations** (Both)
   - Claude: Command center backend
   - Replit: War room interface
   - Claude: Automated responses
   - Replit: Manual controls

#### Success Criteria
- [ ] Auto-scaling works
- [ ] Zero downtime deploys
- [ ] Monitoring complete
- [ ] Alerts configured
- [ ] Rollback tested

---

### Step 6.8: Launch & Post-Launch [P6-6-08]

#### Overview
Execute successful launch and manage post-launch operations.

#### Division of Labor

**Claude Code Tasks:**
1. **Launch Systems**
   - Queue management
   - Server distribution
   - Load balancing
   - Emergency procedures

2. **Post-Launch**
   - Hotfix deployment
   - Performance optimization
   - Issue prioritization
   - Telemetry analysis

**Replit Agent Tasks:**
1. **Launch UI**
   - Queue displays
   - Server status
   - News updates
   - Event announcements

2. **Support UI**
   - Help center
   - Ticket system
   - FAQ updates
   - Community tools

#### Implementation Steps

1. **Launch Execution** (Claude)
   ```typescript
   interface LaunchSystem {
     manageQueue(players: Player[]): QueueStatus;
     distributeLoad(servers: Server[]): Distribution;
     executeContingency(issue: Issue): Response;
     trackLaunchMetrics(): LaunchReport;
   }
   ```

2. **Communication** (Both)
   - Claude: Status API
   - Replit: Status page
   - Claude: Auto-updates
   - Replit: Social media integration

3. **Support Systems** (Both)
   - Claude: Ticket routing
   - Replit: Support interface
   - Claude: Auto-responses
   - Replit: Live chat

4. **Post-Launch Events** (Both)
   - Claude: Event scheduling
   - Replit: Event displays
   - Claude: Reward distribution
   - Replit: Celebration UI

#### Success Criteria
- [ ] Smooth launch
- [ ] Queues managed
- [ ] Issues resolved quickly
- [ ] Players happy
- [ ] Retention high

---

## Implementation Guidelines

### Communication Between Claude & Replit

1. **API Contracts First**
   - Claude defines interfaces
   - Share via TypeScript files
   - Document expected behavior
   - Version interfaces properly

2. **Integration Points**
   - Use TODO comments for handoffs
   - Test integration early
   - Mock missing dependencies
   - Communicate blockers immediately

3. **Code Reviews**
   - Review integration points together
   - Ensure type safety
   - Check error handling
   - Verify performance

### Quality Standards

1. **Performance Metrics**
   - API responses <500ms
   - UI interactions <100ms
   - 60fps animations
   - Mobile-first optimization

2. **Code Quality**
   - TypeScript strict mode
   - 80%+ test coverage
   - Zero linting errors
   - Comprehensive documentation

3. **Security Requirements**
   - Input validation everywhere
   - Rate limiting on all endpoints
   - Secure session management
   - Regular security audits

### Progress Tracking

1. **Daily Sync**
   - Review completed tasks
   - Identify blockers
   - Plan next steps
   - Update documentation

2. **Weekly Milestones**
   - Measure against plan
   - Adjust timeline if needed
   - Celebrate completions
   - Document learnings

3. **Phase Completion**
   - Full integration testing
   - Performance validation
   - Security review
   - Documentation update

This comprehensive guide ensures efficient collaboration between Claude Code and Replit Agent throughout all remaining development phases.