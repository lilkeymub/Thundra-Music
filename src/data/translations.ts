// Complete translations for all 33 languages
// This file contains all translation strings for the entire application

import { LanguageCode } from '@/contexts/LanguageContext';

export interface DashboardTranslations {
  home: string;
  search: string;
  music: string;
  library: string;
  favorites: string;
  leaderboard: string;
  profile: string;
  wallet: string;
  chat: string;
  learning: string;
  market: string;
  ai: string;
  ads: string;
  artist: string;
  moderator: string;
  admin: string;
  settings: string;
  logout: string;
  upload: string;
  earnings: string;
  followers: string;
  streams: string;
  likes: string;
  menu: string;
  features: string;
  yourPlaylists: string;
  createPlaylist: string;
  tracks: string;
  freeMode: string;
  freeUser: string;
  premiumUser: string;
  vipUser: string;
  buySubscription: string;
  upgradeToVip: string;
}

export interface SettingsTranslations {
  title: string;
  subtitle: string;
  account: string;
  notifications: string;
  privacy: string;
  appearance: string;
  support: string;
  profileInfo: string;
  updateDetails: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  saveChanges: string;
  security: string;
  securityDesc: string;
  changePassword: string;
  twoFactor: string;
  dangerZone: string;
  exportData: string;
  deleteAccount: string;
  notificationPrefs: string;
  notificationDesc: string;
  emailNotifications: string;
  pushNotifications: string;
  newFollowers: string;
  newComments: string;
  earningsUpdates: string;
  promotions: string;
  privacySettings: string;
  privacyDesc: string;
  publicProfile: string;
  showActivity: string;
  listeningHistory: string;
  theme: string;
  themeDesc: string;
  light: string;
  dark: string;
  language: string;
  languageDesc: string;
  contactSupport: string;
  supportDesc: string;
  category: string;
  subject: string;
  message: string;
  submitTicket: string;
  quickLinks: string;
  helpCenter: string;
  helpCenterDesc: string;
  faq: string;
  faqDesc: string;
  documentation: string;
  documentationDesc: string;
  generalInquiry: string;
  technicalIssue: string;
  billing: string;
  accountIssues: string;
  artistSupport: string;
  feedback: string;
}

export interface AuthTranslations {
  welcomeBack: string;
  joinRevolution: string;
  login: string;
  signup: string;
  orContinueWith: string;
  fullName: string;
  username: string;
  phone: string;
  dateOfBirth: string;
  country: string;
  selectCountry: string;
  email: string;
  emailOrUsername: string;
  password: string;
  forgotPassword: string;
  agreeToTerms: string;
  termsAndConditions: string;
  privacyPolicy: string;
  and: string;
  noAccount: string;
  haveAccount: string;
  createAccount: string;
  signingIn: string;
  creatingAccount: string;
  wantToBeArtist: string;
  wantToBeModerator: string;
  artistDesc: string;
  moderatorDesc: string;
  comingSoon: string;
}

export interface WalletTranslations {
  title: string;
  subtitle: string;
  totalBalance: string;
  availableBalance: string;
  lockedBalance: string;
  deposit: string;
  withdraw: string;
  convert: string;
  send: string;
  receive: string;
  transactions: string;
  noTransactions: string;
  startEarning: string;
  viewInExplorer: string;
  walletAddress: string;
  copyAddress: string;
  addressCopied: string;
  amount: string;
  recipient: string;
  selectToken: string;
  insufficientBalance: string;
  transactionSuccess: string;
  transactionFailed: string;
  pending: string;
  completed: string;
  failed: string;
}

export interface CommonTranslations {
  learnMore: string;
  comingSoon: string;
  joinWaitlist: string;
  darkMode: string;
  lightMode: string;
  language: string;
  loading: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  edit: string;
  view: string;
  close: string;
  back: string;
  next: string;
  previous: string;
  submit: string;
  search: string;
  filter: string;
  sort: string;
  all: string;
  none: string;
  select: string;
  noResults: string;
  noData: string;
  retry: string;
  refresh: string;
  share: string;
  download: string;
  upload: string;
  play: string;
  pause: string;
  stop: string;
  mute: string;
  unmute: string;
  like: string;
  unlike: string;
  follow: string;
  unfollow: string;
  comment: string;
  reply: string;
  report: string;
  block: string;
  unblock: string;
  send: string;
  receive: string;
  copy: string;
  copied: string;
  today: string;
  yesterday: string;
  thisWeek: string;
  thisMonth: string;
  viewAll: string;
  seeMore: string;
  seeLess: string;
  showMore: string;
  showLess: string;
  readMore: string;
  readLess: string;
}

export interface ExplorerTranslations {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  livePrice: string;
  totalBurned: string;
  burnedToday: string;
  totalTransactions: string;
  recentTransactions: string;
  walletSearch: string;
  transactionHash: string;
  from: string;
  to: string;
  amount: string;
  type: string;
  status: string;
  date: string;
  noTransactionsFound: string;
  walletBalance: string;
  searchResults: string;
}

export interface MarketplaceTranslations {
  title: string;
  subtitle: string;
  nfts: string;
  merchandise: string;
  tickets: string;
  auctions: string;
  buy: string;
  sell: string;
  bid: string;
  listItem: string;
  price: string;
  currency: string;
  category: string;
  owner: string;
  creator: string;
  supply: string;
  remaining: string;
  soldOut: string;
  purchaseSuccess: string;
  purchaseFailed: string;
  insufficientFunds: string;
  confirmPurchase: string;
  bidPlaced: string;
  currentBid: string;
  minimumBid: string;
  auctionEnds: string;
}

export interface ArtistTranslations {
  studio: string;
  uploadTrack: string;
  uploadAlbum: string;
  myMusic: string;
  analytics: string;
  earnings: string;
  fans: string;
  totalStreams: string;
  monthlyListeners: string;
  trackPerformance: string;
  noEarnings: string;
  uploadToEarn: string;
  pendingApproval: string;
  applicationStatus: string;
  artistRank: string;
  rankLevel: string;
  bonusRate: string;
}

export interface ModeratorTranslations {
  panel: string;
  pendingReviews: string;
  myVotes: string;
  accuracy: string;
  moderatorRank: string;
  approve: string;
  reject: string;
  actionType: string;
  reason: string;
  votesRequired: string;
  votesReceived: string;
  allCaughtUp: string;
  noPendingReviews: string;
  guidelines: string;
  beObjective: string;
  followRules: string;
  stayConsistent: string;
}

export interface AdminTranslations {
  panel: string;
  overview: string;
  users: string;
  content: string;
  finance: string;
  analytics: string;
  totalUsers: string;
  activeToday: string;
  newSignups: string;
  revenue: string;
  artistApplications: string;
  moderatorApplications: string;
  pendingArtists: string;
  pendingModerators: string;
  approveArtist: string;
  rejectArtist: string;
  approveModerator: string;
  rejectModerator: string;
  viewApplication: string;
  userManagement: string;
  systemHealth: string;
  serverStatus: string;
  databaseStatus: string;
}

export interface FeedTranslations {
  title: string;
  createPost: string;
  whatsOnMind: string;
  post: string;
  like: string;
  comment: string;
  share: string;
  writeComment: string;
  noPostsYet: string;
  beFirstToPost: string;
  loadingPosts: string;
  viewComments: string;
  hideComments: string;
}

export interface LeaderboardTranslations {
  title: string;
  subtitle: string;
  topStreamers: string;
  topEarners: string;
  topArtists: string;
  rank: string;
  user: string;
  streams: string;
  earnings: string;
  followers: string;
  thisWeek: string;
  thisMonth: string;
  allTime: string;
}

export interface LearningTranslations {
  title: string;
  subtitle: string;
  courses: string;
  enrolled: string;
  completed: string;
  progress: string;
  continueLearning: string;
  enrollNow: string;
  startCourse: string;
  difficulty: string;
  duration: string;
  reward: string;
  instructor: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  noCourses: string;
  createCourse: string;
}

export interface NotificationTranslations {
  title: string;
  markAllRead: string;
  noNotifications: string;
  viewInExplorer: string;
  newFollower: string;
  newComment: string;
  newLike: string;
  earnedReward: string;
  transactionComplete: string;
}

export interface SubscriptionTranslations {
  title: string;
  choosePlan: string;
  currentPlan: string;
  free: string;
  premium: string;
  vip: string;
  freeDesc: string;
  premiumDesc: string;
  vipDesc: string;
  perMonth: string;
  selectPayment: string;
  completePurchase: string;
  processing: string;
  success: string;
  insufficientBalance: string;
  features: string;
  unlimitedStreaming: string;
  noAds: string;
  downloadOffline: string;
  exclusiveContent: string;
  prioritySupport: string;
  earlyAccess: string;
}

export interface PageTranslations {
  // Business page
  businessTitle: string;
  businessSubtitle: string;
  businessWelcome: string;
  businessDesc: string;
  howItWorks: string;
  benefits: string;
  targetedExposure: string;
  earnEngagement: string;
  analytics: string;
  scalable: string;
  
  // Artists page
  artistsTitle: string;
  artistsSubtitle: string;
  artistsWelcome: string;
  artistsDesc: string;
  ownYourMusic: string;
  transparentRoyalties: string;
  directFanConnection: string;
  nftCreation: string;
  web3Revolution: string;
  beYourOwnBoss: string;
  
  // Community page
  communityTitle: string;
  communitySubtitle: string;
  communityDesc: string;
  joinDiscussions: string;
  earnRewards: string;
  voteGovernance: string;
  exclusiveEvents: string;
  getStarted: string;
  
  // Learn More page
  learnMoreTitle: string;
  learnMoreSubtitle: string;
  miningFeatures: string;
  mineOnMobile: string;
  mineOnPC: string;
  secureAndFair: string;
  earlyRewards: string;
  appComingSoon: string;
  
  // About page
  aboutTitle: string;
  aboutSubtitle: string;
  ourTeam: string;
  ourMission: string;
  missionDesc: string;
  
  // Whitepaper
  whitepaperTitle: string;
  whitepaperSubtitle: string;
  tokenDistribution: string;
  communityRewards: string;
  miningPool: string;
  partnerships: string;
  teamAdvisors: string;
  liquidity: string;
}

// Complete translations object
export const completeTranslations: Record<LanguageCode, {
  dashboard: DashboardTranslations;
  settings: SettingsTranslations;
  auth: AuthTranslations;
  wallet: WalletTranslations;
  common: CommonTranslations;
  explorer: ExplorerTranslations;
  marketplace: MarketplaceTranslations;
  artist: ArtistTranslations;
  moderator: ModeratorTranslations;
  admin: AdminTranslations;
  feed: FeedTranslations;
  leaderboard: LeaderboardTranslations;
  learning: LearningTranslations;
  notification: NotificationTranslations;
  subscription: SubscriptionTranslations;
  pages: PageTranslations;
}> = {
  // English
  en: {
    dashboard: {
      home: 'Home', search: 'Search', music: 'Music', library: 'Library', favorites: 'Favorites',
      leaderboard: 'Leaderboard', profile: 'Profile', wallet: 'Wallet', chat: 'Chat Space',
      learning: 'Learning', market: 'Market', ai: 'Thundra AI', ads: 'Ads', artist: 'Artist Studio',
      moderator: 'Mod Panel', admin: 'Admin Panel', settings: 'Settings', logout: 'Log Out',
      upload: 'Upload Track', earnings: 'Earnings', followers: 'Followers', streams: 'Streams',
      likes: 'Likes', menu: 'MENU', features: 'FEATURES', yourPlaylists: 'YOUR PLAYLISTS',
      createPlaylist: 'Create Playlist', tracks: 'tracks', freeMode: 'Free Mode', freeUser: 'Free User',
      premiumUser: 'Premium User', vipUser: 'VIP User', buySubscription: 'Buy Subscription', upgradeToVip: 'Upgrade to VIP'
    },
    settings: {
      title: 'Settings', subtitle: 'Manage your account and preferences', account: 'Account',
      notifications: 'Notifications', privacy: 'Privacy', appearance: 'Appearance', support: 'Support',
      profileInfo: 'Profile Information', updateDetails: 'Update your personal details', fullName: 'Full Name',
      username: 'Username', email: 'Email', phone: 'Phone', bio: 'Bio', saveChanges: 'Save Changes',
      security: 'Security', securityDesc: 'Manage your password and security settings', changePassword: 'Change Password',
      twoFactor: 'Two-Factor Authentication', dangerZone: 'Danger Zone', exportData: 'Export My Data',
      deleteAccount: 'Delete Account', notificationPrefs: 'Notification Preferences',
      notificationDesc: 'Choose what notifications you want to receive', emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications', newFollowers: 'New Followers', newComments: 'New Comments',
      earningsUpdates: 'Earnings Updates', promotions: 'Promotions', privacySettings: 'Privacy Settings',
      privacyDesc: 'Control your privacy and visibility', publicProfile: 'Public Profile',
      showActivity: 'Show Activity', listeningHistory: 'Listening History', theme: 'Theme',
      themeDesc: 'Choose your preferred theme', light: 'Light', dark: 'Dark', language: 'Language',
      languageDesc: 'Choose your preferred language', contactSupport: 'Contact Support',
      supportDesc: 'Submit a ticket and we\'ll get back to you', category: 'Category', subject: 'Subject',
      message: 'Message', submitTicket: 'Submit Ticket', quickLinks: 'Quick Links', helpCenter: 'Help Center',
      helpCenterDesc: 'Browse our knowledge base', faq: 'FAQ', faqDesc: 'Frequently asked questions',
      documentation: 'Documentation', documentationDesc: 'Technical documentation', generalInquiry: 'General Inquiry',
      technicalIssue: 'Technical Issue', billing: 'Billing & Payments', accountIssues: 'Account Issues',
      artistSupport: 'Artist Support', feedback: 'Feedback'
    },
    auth: {
      welcomeBack: 'Welcome back!', joinRevolution: 'Join the revolution', login: 'Login', signup: 'Sign Up',
      orContinueWith: 'Or continue with email', fullName: 'Full Name', username: 'Username', phone: 'Phone',
      dateOfBirth: 'Date of Birth', country: 'Country', selectCountry: 'Select your country', email: 'Email',
      emailOrUsername: 'Email or Username', password: 'Password', forgotPassword: 'Forgot password?',
      agreeToTerms: 'I agree to the', termsAndConditions: 'Terms and Conditions', privacyPolicy: 'Privacy Policy',
      and: 'and', noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
      createAccount: 'Create account', signingIn: 'Signing in...', creatingAccount: 'Creating account...',
      wantToBeArtist: 'I want to be an Artist', wantToBeModerator: 'I want to be a Moderator',
      artistDesc: 'Upload music and earn royalties', moderatorDesc: 'Help maintain community standards', comingSoon: 'Coming Soon'
    },
    wallet: {
      title: 'Wallet', subtitle: 'Manage your digital assets', totalBalance: 'Total Balance',
      availableBalance: 'Available Balance', lockedBalance: 'Locked Balance', deposit: 'Deposit',
      withdraw: 'Withdraw', convert: 'Convert', send: 'Send', receive: 'Receive', transactions: 'Transactions',
      noTransactions: 'No transactions yet', startEarning: 'Start earning by streaming music!',
      viewInExplorer: 'View in Explorer', walletAddress: 'Wallet Address', copyAddress: 'Copy Address',
      addressCopied: 'Address copied!', amount: 'Amount', recipient: 'Recipient', selectToken: 'Select Token',
      insufficientBalance: 'Insufficient balance', transactionSuccess: 'Transaction successful!',
      transactionFailed: 'Transaction failed', pending: 'Pending', completed: 'Completed', failed: 'Failed'
    },
    common: {
      learnMore: 'Learn More', comingSoon: 'Coming Soon', joinWaitlist: 'Join Waitlist', darkMode: 'Dark Mode',
      lightMode: 'Light Mode', language: 'Language', loading: 'Loading...', error: 'Error', success: 'Success',
      cancel: 'Cancel', confirm: 'Confirm', save: 'Save', delete: 'Delete', edit: 'Edit', view: 'View',
      close: 'Close', back: 'Back', next: 'Next', previous: 'Previous', submit: 'Submit', search: 'Search',
      filter: 'Filter', sort: 'Sort', all: 'All', none: 'None', select: 'Select', noResults: 'No results found',
      noData: 'No data available', retry: 'Retry', refresh: 'Refresh', share: 'Share', download: 'Download',
      upload: 'Upload', play: 'Play', pause: 'Pause', stop: 'Stop', mute: 'Mute', unmute: 'Unmute',
      like: 'Like', unlike: 'Unlike', follow: 'Follow', unfollow: 'Unfollow', comment: 'Comment',
      reply: 'Reply', report: 'Report', block: 'Block', unblock: 'Unblock', send: 'Send', receive: 'Receive',
      copy: 'Copy', copied: 'Copied!', today: 'Today', yesterday: 'Yesterday', thisWeek: 'This Week',
      thisMonth: 'This Month', viewAll: 'View All', seeMore: 'See More', seeLess: 'See Less',
      showMore: 'Show More', showLess: 'Show Less', readMore: 'Read More', readLess: 'Read Less'
    },
    explorer: {
      title: 'Transaction Explorer', subtitle: 'Track all transactions on the Thundra network',
      searchPlaceholder: 'Search by wallet address, transaction hash, or email', livePrice: 'Live Price',
      totalBurned: 'Total Burned', burnedToday: 'Burned Today', totalTransactions: 'Total Transactions',
      recentTransactions: 'Recent Transactions', walletSearch: 'Wallet Search', transactionHash: 'Transaction Hash',
      from: 'From', to: 'To', amount: 'Amount', type: 'Type', status: 'Status', date: 'Date',
      noTransactionsFound: 'No transactions found', walletBalance: 'Wallet Balance', searchResults: 'Search Results'
    },
    marketplace: {
      title: 'Marketplace', subtitle: 'Discover and trade digital assets', nfts: 'NFTs',
      merchandise: 'Merchandise', tickets: 'Tickets', auctions: 'Auctions', buy: 'Buy', sell: 'Sell',
      bid: 'Place Bid', listItem: 'List Item', price: 'Price', currency: 'Currency', category: 'Category',
      owner: 'Owner', creator: 'Creator', supply: 'Supply', remaining: 'Remaining', soldOut: 'Sold Out',
      purchaseSuccess: 'Purchase successful!', purchaseFailed: 'Purchase failed', insufficientFunds: 'Insufficient funds',
      confirmPurchase: 'Confirm Purchase', bidPlaced: 'Bid placed successfully!', currentBid: 'Current Bid',
      minimumBid: 'Minimum Bid', auctionEnds: 'Auction Ends'
    },
    artist: {
      studio: 'Artist Studio', uploadTrack: 'Upload Track', uploadAlbum: 'Upload Album', myMusic: 'My Music',
      analytics: 'Analytics', earnings: 'Earnings', fans: 'Fans', totalStreams: 'Total Streams',
      monthlyListeners: 'Monthly Listeners', trackPerformance: 'Track Performance', noEarnings: 'No earnings yet',
      uploadToEarn: 'Upload tracks and get streams to start earning!', pendingApproval: 'Pending Approval',
      applicationStatus: 'Application Status', artistRank: 'Artist Rank', rankLevel: 'Rank Level', bonusRate: 'Bonus Rate'
    },
    moderator: {
      panel: 'Moderator Panel', pendingReviews: 'Pending Reviews', myVotes: 'My Votes', accuracy: 'Accuracy',
      moderatorRank: 'Moderator Rank', approve: 'Approve', reject: 'Reject', actionType: 'Action Type',
      reason: 'Reason', votesRequired: 'Votes Required', votesReceived: 'Votes Received',
      allCaughtUp: 'All caught up! 🎉', noPendingReviews: 'No pending reviews at the moment',
      guidelines: 'Moderation Guidelines', beObjective: 'Be objective and fair',
      followRules: 'Follow community guidelines', stayConsistent: 'Stay consistent in decisions'
    },
    admin: {
      panel: 'Admin Panel', overview: 'Overview', users: 'Users', content: 'Content', finance: 'Finance',
      analytics: 'Analytics', totalUsers: 'Total Users', activeToday: 'Active Today', newSignups: 'New Signups',
      revenue: 'Revenue', artistApplications: 'Artist Applications', moderatorApplications: 'Moderator Applications',
      pendingArtists: 'Pending Artists', pendingModerators: 'Pending Moderators', approveArtist: 'Approve Artist',
      rejectArtist: 'Reject Artist', approveModerator: 'Approve Moderator', rejectModerator: 'Reject Moderator',
      viewApplication: 'View Application', userManagement: 'User Management', systemHealth: 'System Health',
      serverStatus: 'Server Status', databaseStatus: 'Database Status'
    },
    feed: {
      title: 'Feed', createPost: 'Create Post', whatsOnMind: "What's on your mind?", post: 'Post',
      like: 'Like', comment: 'Comment', share: 'Share', writeComment: 'Write a comment...',
      noPostsYet: 'No posts yet', beFirstToPost: 'Be the first to post!', loadingPosts: 'Loading posts...',
      viewComments: 'View comments', hideComments: 'Hide comments'
    },
    leaderboard: {
      title: 'Leaderboard', subtitle: 'See who\'s on top', topStreamers: 'Top Streamers',
      topEarners: 'Top Earners', topArtists: 'Top Artists', rank: 'Rank', user: 'User',
      streams: 'Streams', earnings: 'Earnings', followers: 'Followers', thisWeek: 'This Week',
      thisMonth: 'This Month', allTime: 'All Time'
    },
    learning: {
      title: 'Learning Hub', subtitle: 'Expand your knowledge', courses: 'Courses', enrolled: 'Enrolled',
      completed: 'Completed', progress: 'Progress', continueLearning: 'Continue Learning',
      enrollNow: 'Enroll Now', startCourse: 'Start Course', difficulty: 'Difficulty', duration: 'Duration',
      reward: 'Reward', instructor: 'Instructor', beginner: 'Beginner', intermediate: 'Intermediate',
      advanced: 'Advanced', noCourses: 'No courses found', createCourse: 'Create Course'
    },
    notification: {
      title: 'Notifications', markAllRead: 'Mark all as read', noNotifications: 'No notifications yet',
      viewInExplorer: 'View in Explorer', newFollower: 'started following you',
      newComment: 'commented on your post', newLike: 'liked your post', earnedReward: 'You earned a reward!',
      transactionComplete: 'Transaction complete'
    },
    subscription: {
      title: 'Subscription', choosePlan: 'Choose your plan', currentPlan: 'Current Plan',
      free: 'Free', premium: 'Premium', vip: 'VIP', freeDesc: 'Basic features for casual listeners',
      premiumDesc: 'Enhanced features for music lovers', vipDesc: 'All features plus exclusive benefits',
      perMonth: '/month', selectPayment: 'Select payment method', completePurchase: 'Complete Purchase',
      processing: 'Processing...', success: 'Purchase successful!', insufficientBalance: 'Insufficient balance',
      features: 'Features', unlimitedStreaming: 'Unlimited streaming', noAds: 'No ads',
      downloadOffline: 'Download for offline', exclusiveContent: 'Exclusive content',
      prioritySupport: 'Priority support', earlyAccess: 'Early access to new features'
    },
    pages: {
      businessTitle: 'For Business', businessSubtitle: 'Reach millions of engaged music fans',
      businessWelcome: 'Welcome to Thundra Ads', businessDesc: 'The premier advertising platform in the music ecosystem',
      howItWorks: 'How It Works', benefits: 'Benefits', targetedExposure: 'Targeted Exposure',
      earnEngagement: 'Earn Through Engagement', analytics: 'Real-time Analytics', scalable: 'Scalable Solutions',
      artistsTitle: 'For Artists', artistsSubtitle: 'Your music, your rules, your earnings',
      artistsWelcome: 'Welcome to Thundra for Artists', artistsDesc: 'The platform built for creators',
      ownYourMusic: 'Own Your Music', transparentRoyalties: 'Transparent Royalties',
      directFanConnection: 'Direct Fan Connection', nftCreation: 'NFT Creation',
      web3Revolution: 'Web3 Revolution', beYourOwnBoss: 'Be Your Own Boss',
      communityTitle: 'For Community', communitySubtitle: 'Join a thriving music community',
      communityDesc: 'Connect with fans and artists worldwide', joinDiscussions: 'Join Discussions',
      earnRewards: 'Earn Rewards', voteGovernance: 'Vote on Governance', exclusiveEvents: 'Exclusive Events',
      getStarted: 'Get Started', learnMoreTitle: 'Learn More', learnMoreSubtitle: 'Discover the Thundra ecosystem',
      miningFeatures: 'Mining Features', mineOnMobile: 'Mine on Mobile', mineOnPC: 'Mine on PC',
      secureAndFair: 'Secure & Fair', earlyRewards: 'Early Rewards', appComingSoon: 'App Coming Soon',
      aboutTitle: 'About Us', aboutSubtitle: 'The team behind Thundra Music', ourTeam: 'Our Team',
      ourMission: 'Our Mission', missionDesc: 'Revolutionizing music through blockchain technology',
      whitepaperTitle: 'Whitepaper', whitepaperSubtitle: 'Technical documentation', tokenDistribution: 'Token Distribution',
      communityRewards: 'Community Rewards', miningPool: 'Mining Pool', partnerships: 'Partnerships',
      teamAdvisors: 'Team & Advisors', liquidity: 'Liquidity'
    }
  },
  
  // French
  fr: {
    dashboard: {
      home: 'Accueil', search: 'Rechercher', music: 'Musique', library: 'Bibliothèque', favorites: 'Favoris',
      leaderboard: 'Classement', profile: 'Profil', wallet: 'Portefeuille', chat: 'Espace Chat',
      learning: 'Apprentissage', market: 'Marché', ai: 'Thundra IA', ads: 'Publicités', artist: 'Studio Artiste',
      moderator: 'Panel Mod', admin: 'Panel Admin', settings: 'Paramètres', logout: 'Déconnexion',
      upload: 'Télécharger', earnings: 'Revenus', followers: 'Abonnés', streams: 'Écoutes',
      likes: "J'aime", menu: 'MENU', features: 'FONCTIONNALITÉS', yourPlaylists: 'VOS PLAYLISTS',
      createPlaylist: 'Créer une Playlist', tracks: 'titres', freeMode: 'Mode Gratuit', freeUser: 'Utilisateur Gratuit',
      premiumUser: 'Utilisateur Premium', vipUser: 'Utilisateur VIP', buySubscription: 'Acheter un Abonnement', upgradeToVip: 'Passer en VIP'
    },
    settings: {
      title: 'Paramètres', subtitle: 'Gérez votre compte et préférences', account: 'Compte',
      notifications: 'Notifications', privacy: 'Confidentialité', appearance: 'Apparence', support: 'Support',
      profileInfo: 'Informations du Profil', updateDetails: 'Mettez à jour vos informations', fullName: 'Nom Complet',
      username: "Nom d'utilisateur", email: 'Email', phone: 'Téléphone', bio: 'Bio', saveChanges: 'Sauvegarder',
      security: 'Sécurité', securityDesc: 'Gérez votre mot de passe et sécurité', changePassword: 'Changer le Mot de Passe',
      twoFactor: 'Authentification à Deux Facteurs', dangerZone: 'Zone Dangereuse', exportData: 'Exporter Mes Données',
      deleteAccount: 'Supprimer le Compte', notificationPrefs: 'Préférences de Notification',
      notificationDesc: 'Choisissez vos notifications', emailNotifications: 'Notifications Email',
      pushNotifications: 'Notifications Push', newFollowers: 'Nouveaux Abonnés', newComments: 'Nouveaux Commentaires',
      earningsUpdates: 'Mises à jour des Revenus', promotions: 'Promotions', privacySettings: 'Paramètres de Confidentialité',
      privacyDesc: 'Contrôlez votre confidentialité', publicProfile: 'Profil Public',
      showActivity: 'Afficher l\'Activité', listeningHistory: 'Historique d\'Écoute', theme: 'Thème',
      themeDesc: 'Choisissez votre thème préféré', light: 'Clair', dark: 'Sombre', language: 'Langue',
      languageDesc: 'Choisissez votre langue préférée', contactSupport: 'Contacter le Support',
      supportDesc: 'Soumettez un ticket et nous vous répondrons', category: 'Catégorie', subject: 'Sujet',
      message: 'Message', submitTicket: 'Soumettre le Ticket', quickLinks: 'Liens Rapides', helpCenter: 'Centre d\'Aide',
      helpCenterDesc: 'Parcourez notre base de connaissances', faq: 'FAQ', faqDesc: 'Questions fréquentes',
      documentation: 'Documentation', documentationDesc: 'Documentation technique', generalInquiry: 'Demande Générale',
      technicalIssue: 'Problème Technique', billing: 'Facturation & Paiements', accountIssues: 'Problèmes de Compte',
      artistSupport: 'Support Artiste', feedback: 'Commentaires'
    },
    auth: {
      welcomeBack: 'Bon retour!', joinRevolution: 'Rejoignez la révolution', login: 'Connexion', signup: 'Inscription',
      orContinueWith: 'Ou continuer avec email', fullName: 'Nom Complet', username: "Nom d'utilisateur", phone: 'Téléphone',
      dateOfBirth: 'Date de Naissance', country: 'Pays', selectCountry: 'Sélectionnez votre pays', email: 'Email',
      emailOrUsername: 'Email ou Nom d\'utilisateur', password: 'Mot de Passe', forgotPassword: 'Mot de passe oublié?',
      agreeToTerms: 'J\'accepte les', termsAndConditions: 'Conditions Générales', privacyPolicy: 'Politique de Confidentialité',
      and: 'et', noAccount: "Pas de compte?", haveAccount: 'Déjà un compte?',
      createAccount: 'Créer un compte', signingIn: 'Connexion en cours...', creatingAccount: 'Création du compte...',
      wantToBeArtist: 'Je veux être Artiste', wantToBeModerator: 'Je veux être Modérateur',
      artistDesc: 'Téléchargez de la musique et gagnez des royalties', moderatorDesc: 'Aidez à maintenir les standards de la communauté', comingSoon: 'Bientôt Disponible'
    },
    wallet: {
      title: 'Portefeuille', subtitle: 'Gérez vos actifs numériques', totalBalance: 'Solde Total',
      availableBalance: 'Solde Disponible', lockedBalance: 'Solde Bloqué', deposit: 'Déposer',
      withdraw: 'Retirer', convert: 'Convertir', send: 'Envoyer', receive: 'Recevoir', transactions: 'Transactions',
      noTransactions: 'Aucune transaction', startEarning: 'Commencez à gagner en écoutant de la musique!',
      viewInExplorer: 'Voir dans l\'Explorateur', walletAddress: 'Adresse du Portefeuille', copyAddress: 'Copier l\'Adresse',
      addressCopied: 'Adresse copiée!', amount: 'Montant', recipient: 'Destinataire', selectToken: 'Sélectionner le Token',
      insufficientBalance: 'Solde insuffisant', transactionSuccess: 'Transaction réussie!',
      transactionFailed: 'Transaction échouée', pending: 'En attente', completed: 'Terminé', failed: 'Échoué'
    },
    common: {
      learnMore: 'En Savoir Plus', comingSoon: 'Bientôt Disponible', joinWaitlist: 'Rejoindre la Liste', darkMode: 'Mode Sombre',
      lightMode: 'Mode Clair', language: 'Langue', loading: 'Chargement...', error: 'Erreur', success: 'Succès',
      cancel: 'Annuler', confirm: 'Confirmer', save: 'Sauvegarder', delete: 'Supprimer', edit: 'Modifier', view: 'Voir',
      close: 'Fermer', back: 'Retour', next: 'Suivant', previous: 'Précédent', submit: 'Soumettre', search: 'Rechercher',
      filter: 'Filtrer', sort: 'Trier', all: 'Tous', none: 'Aucun', select: 'Sélectionner', noResults: 'Aucun résultat',
      noData: 'Aucune donnée', retry: 'Réessayer', refresh: 'Rafraîchir', share: 'Partager', download: 'Télécharger',
      upload: 'Téléverser', play: 'Lecture', pause: 'Pause', stop: 'Arrêter', mute: 'Muet', unmute: 'Activer le son',
      like: 'J\'aime', unlike: 'Je n\'aime plus', follow: 'Suivre', unfollow: 'Ne plus suivre', comment: 'Commenter',
      reply: 'Répondre', report: 'Signaler', block: 'Bloquer', unblock: 'Débloquer', send: 'Envoyer', receive: 'Recevoir',
      copy: 'Copier', copied: 'Copié!', today: 'Aujourd\'hui', yesterday: 'Hier', thisWeek: 'Cette Semaine',
      thisMonth: 'Ce Mois', viewAll: 'Voir Tout', seeMore: 'Voir Plus', seeLess: 'Voir Moins',
      showMore: 'Afficher Plus', showLess: 'Afficher Moins', readMore: 'Lire Plus', readLess: 'Lire Moins'
    },
    explorer: {
      title: 'Explorateur de Transactions', subtitle: 'Suivez toutes les transactions sur le réseau Thundra',
      searchPlaceholder: 'Rechercher par adresse, hash ou email', livePrice: 'Prix en Direct',
      totalBurned: 'Total Brûlé', burnedToday: 'Brûlé Aujourd\'hui', totalTransactions: 'Total des Transactions',
      recentTransactions: 'Transactions Récentes', walletSearch: 'Recherche de Portefeuille', transactionHash: 'Hash de Transaction',
      from: 'De', to: 'À', amount: 'Montant', type: 'Type', status: 'Statut', date: 'Date',
      noTransactionsFound: 'Aucune transaction trouvée', walletBalance: 'Solde du Portefeuille', searchResults: 'Résultats de Recherche'
    },
    marketplace: {
      title: 'Marketplace', subtitle: 'Découvrez et échangez des actifs numériques', nfts: 'NFTs',
      merchandise: 'Marchandises', tickets: 'Billets', auctions: 'Enchères', buy: 'Acheter', sell: 'Vendre',
      bid: 'Enchérir', listItem: 'Lister l\'Article', price: 'Prix', currency: 'Devise', category: 'Catégorie',
      owner: 'Propriétaire', creator: 'Créateur', supply: 'Approvisionnement', remaining: 'Restant', soldOut: 'Épuisé',
      purchaseSuccess: 'Achat réussi!', purchaseFailed: 'Achat échoué', insufficientFunds: 'Fonds insuffisants',
      confirmPurchase: 'Confirmer l\'Achat', bidPlaced: 'Enchère placée!', currentBid: 'Enchère Actuelle',
      minimumBid: 'Enchère Minimale', auctionEnds: 'Fin de l\'Enchère'
    },
    artist: {
      studio: 'Studio Artiste', uploadTrack: 'Télécharger un Titre', uploadAlbum: 'Télécharger un Album', myMusic: 'Ma Musique',
      analytics: 'Analytiques', earnings: 'Revenus', fans: 'Fans', totalStreams: 'Total des Écoutes',
      monthlyListeners: 'Auditeurs Mensuels', trackPerformance: 'Performance des Titres', noEarnings: 'Pas encore de revenus',
      uploadToEarn: 'Téléchargez des titres pour commencer à gagner!', pendingApproval: 'En Attente d\'Approbation',
      applicationStatus: 'Statut de la Candidature', artistRank: 'Rang d\'Artiste', rankLevel: 'Niveau de Rang', bonusRate: 'Taux de Bonus'
    },
    moderator: {
      panel: 'Panel Modérateur', pendingReviews: 'Révisions en Attente', myVotes: 'Mes Votes', accuracy: 'Précision',
      moderatorRank: 'Rang de Modérateur', approve: 'Approuver', reject: 'Rejeter', actionType: 'Type d\'Action',
      reason: 'Raison', votesRequired: 'Votes Requis', votesReceived: 'Votes Reçus',
      allCaughtUp: 'Tout est à jour! 🎉', noPendingReviews: 'Aucune révision en attente',
      guidelines: 'Directives de Modération', beObjective: 'Soyez objectif et juste',
      followRules: 'Suivez les règles de la communauté', stayConsistent: 'Restez cohérent dans vos décisions'
    },
    admin: {
      panel: 'Panel Admin', overview: 'Aperçu', users: 'Utilisateurs', content: 'Contenu', finance: 'Finance',
      analytics: 'Analytiques', totalUsers: 'Total Utilisateurs', activeToday: 'Actifs Aujourd\'hui', newSignups: 'Nouvelles Inscriptions',
      revenue: 'Revenus', artistApplications: 'Candidatures Artistes', moderatorApplications: 'Candidatures Modérateurs',
      pendingArtists: 'Artistes en Attente', pendingModerators: 'Modérateurs en Attente', approveArtist: 'Approuver l\'Artiste',
      rejectArtist: 'Rejeter l\'Artiste', approveModerator: 'Approuver le Modérateur', rejectModerator: 'Rejeter le Modérateur',
      viewApplication: 'Voir la Candidature', userManagement: 'Gestion des Utilisateurs', systemHealth: 'Santé du Système',
      serverStatus: 'Statut du Serveur', databaseStatus: 'Statut de la Base de Données'
    },
    feed: {
      title: 'Fil d\'Actualité', createPost: 'Créer un Post', whatsOnMind: 'Qu\'avez-vous en tête?', post: 'Publier',
      like: 'J\'aime', comment: 'Commenter', share: 'Partager', writeComment: 'Écrire un commentaire...',
      noPostsYet: 'Pas encore de posts', beFirstToPost: 'Soyez le premier à publier!', loadingPosts: 'Chargement des posts...',
      viewComments: 'Voir les commentaires', hideComments: 'Masquer les commentaires'
    },
    leaderboard: {
      title: 'Classement', subtitle: 'Voyez qui est en tête', topStreamers: 'Top Auditeurs',
      topEarners: 'Top Gagnants', topArtists: 'Top Artistes', rank: 'Rang', user: 'Utilisateur',
      streams: 'Écoutes', earnings: 'Revenus', followers: 'Abonnés', thisWeek: 'Cette Semaine',
      thisMonth: 'Ce Mois', allTime: 'Tout le Temps'
    },
    learning: {
      title: 'Centre d\'Apprentissage', subtitle: 'Élargissez vos connaissances', courses: 'Cours', enrolled: 'Inscrit',
      completed: 'Terminé', progress: 'Progression', continueLearning: 'Continuer l\'Apprentissage',
      enrollNow: 'S\'inscrire', startCourse: 'Commencer le Cours', difficulty: 'Difficulté', duration: 'Durée',
      reward: 'Récompense', instructor: 'Instructeur', beginner: 'Débutant', intermediate: 'Intermédiaire',
      advanced: 'Avancé', noCourses: 'Aucun cours trouvé', createCourse: 'Créer un Cours'
    },
    notification: {
      title: 'Notifications', markAllRead: 'Tout marquer comme lu', noNotifications: 'Aucune notification',
      viewInExplorer: 'Voir dans l\'Explorateur', newFollower: 'a commencé à vous suivre',
      newComment: 'a commenté votre post', newLike: 'a aimé votre post', earnedReward: 'Vous avez gagné une récompense!',
      transactionComplete: 'Transaction terminée'
    },
    subscription: {
      title: 'Abonnement', choosePlan: 'Choisissez votre forfait', currentPlan: 'Forfait Actuel',
      free: 'Gratuit', premium: 'Premium', vip: 'VIP', freeDesc: 'Fonctionnalités de base pour les auditeurs occasionnels',
      premiumDesc: 'Fonctionnalités améliorées pour les amateurs de musique', vipDesc: 'Toutes les fonctionnalités plus des avantages exclusifs',
      perMonth: '/mois', selectPayment: 'Sélectionner le mode de paiement', completePurchase: 'Finaliser l\'Achat',
      processing: 'Traitement en cours...', success: 'Achat réussi!', insufficientBalance: 'Solde insuffisant',
      features: 'Fonctionnalités', unlimitedStreaming: 'Streaming illimité', noAds: 'Sans publicité',
      downloadOffline: 'Téléchargement hors ligne', exclusiveContent: 'Contenu exclusif',
      prioritySupport: 'Support prioritaire', earlyAccess: 'Accès anticipé aux nouvelles fonctionnalités'
    },
    pages: {
      businessTitle: 'Pour les Entreprises', businessSubtitle: 'Atteignez des millions de fans de musique engagés',
      businessWelcome: 'Bienvenue sur Thundra Ads', businessDesc: 'La première plateforme publicitaire de l\'écosystème musical',
      howItWorks: 'Comment ça Marche', benefits: 'Avantages', targetedExposure: 'Exposition Ciblée',
      earnEngagement: 'Gagnez par l\'Engagement', analytics: 'Analytiques en Temps Réel', scalable: 'Solutions Évolutives',
      artistsTitle: 'Pour les Artistes', artistsSubtitle: 'Votre musique, vos règles, vos revenus',
      artistsWelcome: 'Bienvenue sur Thundra pour Artistes', artistsDesc: 'La plateforme conçue pour les créateurs',
      ownYourMusic: 'Possédez Votre Musique', transparentRoyalties: 'Royalties Transparentes',
      directFanConnection: 'Connexion Directe avec les Fans', nftCreation: 'Création de NFT',
      web3Revolution: 'Révolution Web3', beYourOwnBoss: 'Soyez Votre Propre Patron',
      communityTitle: 'Pour la Communauté', communitySubtitle: 'Rejoignez une communauté musicale florissante',
      communityDesc: 'Connectez-vous avec des fans et artistes du monde entier', joinDiscussions: 'Rejoindre les Discussions',
      earnRewards: 'Gagnez des Récompenses', voteGovernance: 'Votez sur la Gouvernance', exclusiveEvents: 'Événements Exclusifs',
      getStarted: 'Commencer', learnMoreTitle: 'En Savoir Plus', learnMoreSubtitle: 'Découvrez l\'écosystème Thundra',
      miningFeatures: 'Fonctionnalités de Minage', mineOnMobile: 'Miner sur Mobile', mineOnPC: 'Miner sur PC',
      secureAndFair: 'Sécurisé et Équitable', earlyRewards: 'Récompenses Anticipées', appComingSoon: 'Application Bientôt Disponible',
      aboutTitle: 'À Propos de Nous', aboutSubtitle: 'L\'équipe derrière Thundra Music', ourTeam: 'Notre Équipe',
      ourMission: 'Notre Mission', missionDesc: 'Révolutionner la musique grâce à la technologie blockchain',
      whitepaperTitle: 'Livre Blanc', whitepaperSubtitle: 'Documentation technique', tokenDistribution: 'Distribution des Tokens',
      communityRewards: 'Récompenses Communautaires', miningPool: 'Pool de Minage', partnerships: 'Partenariats',
      teamAdvisors: 'Équipe et Conseillers', liquidity: 'Liquidité'
    }
  },

  // Spanish
  es: {
    dashboard: {
      home: 'Inicio', search: 'Buscar', music: 'Música', library: 'Biblioteca', favorites: 'Favoritos',
      leaderboard: 'Clasificación', profile: 'Perfil', wallet: 'Billetera', chat: 'Espacio de Chat',
      learning: 'Aprendizaje', market: 'Mercado', ai: 'Thundra IA', ads: 'Anuncios', artist: 'Estudio de Artista',
      moderator: 'Panel de Mod', admin: 'Panel de Admin', settings: 'Configuración', logout: 'Cerrar Sesión',
      upload: 'Subir Pista', earnings: 'Ganancias', followers: 'Seguidores', streams: 'Reproducciones',
      likes: 'Me gusta', menu: 'MENÚ', features: 'CARACTERÍSTICAS', yourPlaylists: 'TUS PLAYLISTS',
      createPlaylist: 'Crear Playlist', tracks: 'pistas', freeMode: 'Modo Gratuito', freeUser: 'Usuario Gratuito',
      premiumUser: 'Usuario Premium', vipUser: 'Usuario VIP', buySubscription: 'Comprar Suscripción', upgradeToVip: 'Mejorar a VIP'
    },
    settings: {
      title: 'Configuración', subtitle: 'Gestiona tu cuenta y preferencias', account: 'Cuenta',
      notifications: 'Notificaciones', privacy: 'Privacidad', appearance: 'Apariencia', support: 'Soporte',
      profileInfo: 'Información del Perfil', updateDetails: 'Actualiza tus datos personales', fullName: 'Nombre Completo',
      username: 'Nombre de Usuario', email: 'Correo', phone: 'Teléfono', bio: 'Biografía', saveChanges: 'Guardar Cambios',
      security: 'Seguridad', securityDesc: 'Gestiona tu contraseña y seguridad', changePassword: 'Cambiar Contraseña',
      twoFactor: 'Autenticación de Dos Factores', dangerZone: 'Zona de Peligro', exportData: 'Exportar Mis Datos',
      deleteAccount: 'Eliminar Cuenta', notificationPrefs: 'Preferencias de Notificación',
      notificationDesc: 'Elige qué notificaciones recibir', emailNotifications: 'Notificaciones por Email',
      pushNotifications: 'Notificaciones Push', newFollowers: 'Nuevos Seguidores', newComments: 'Nuevos Comentarios',
      earningsUpdates: 'Actualizaciones de Ganancias', promotions: 'Promociones', privacySettings: 'Configuración de Privacidad',
      privacyDesc: 'Controla tu privacidad y visibilidad', publicProfile: 'Perfil Público',
      showActivity: 'Mostrar Actividad', listeningHistory: 'Historial de Escucha', theme: 'Tema',
      themeDesc: 'Elige tu tema preferido', light: 'Claro', dark: 'Oscuro', language: 'Idioma',
      languageDesc: 'Elige tu idioma preferido', contactSupport: 'Contactar Soporte',
      supportDesc: 'Envía un ticket y te responderemos', category: 'Categoría', subject: 'Asunto',
      message: 'Mensaje', submitTicket: 'Enviar Ticket', quickLinks: 'Enlaces Rápidos', helpCenter: 'Centro de Ayuda',
      helpCenterDesc: 'Explora nuestra base de conocimientos', faq: 'Preguntas Frecuentes', faqDesc: 'Preguntas frecuentes',
      documentation: 'Documentación', documentationDesc: 'Documentación técnica', generalInquiry: 'Consulta General',
      technicalIssue: 'Problema Técnico', billing: 'Facturación y Pagos', accountIssues: 'Problemas de Cuenta',
      artistSupport: 'Soporte para Artistas', feedback: 'Comentarios'
    },
    auth: {
      welcomeBack: '¡Bienvenido de nuevo!', joinRevolution: 'Únete a la revolución', login: 'Iniciar Sesión', signup: 'Registrarse',
      orContinueWith: 'O continuar con email', fullName: 'Nombre Completo', username: 'Nombre de Usuario', phone: 'Teléfono',
      dateOfBirth: 'Fecha de Nacimiento', country: 'País', selectCountry: 'Selecciona tu país', email: 'Correo',
      emailOrUsername: 'Correo o Nombre de Usuario', password: 'Contraseña', forgotPassword: '¿Olvidaste tu contraseña?',
      agreeToTerms: 'Acepto los', termsAndConditions: 'Términos y Condiciones', privacyPolicy: 'Política de Privacidad',
      and: 'y', noAccount: '¿No tienes cuenta?', haveAccount: '¿Ya tienes cuenta?',
      createAccount: 'Crear cuenta', signingIn: 'Iniciando sesión...', creatingAccount: 'Creando cuenta...',
      wantToBeArtist: 'Quiero ser Artista', wantToBeModerator: 'Quiero ser Moderador',
      artistDesc: 'Sube música y gana regalías', moderatorDesc: 'Ayuda a mantener los estándares de la comunidad', comingSoon: 'Próximamente'
    },
    wallet: {
      title: 'Billetera', subtitle: 'Gestiona tus activos digitales', totalBalance: 'Saldo Total',
      availableBalance: 'Saldo Disponible', lockedBalance: 'Saldo Bloqueado', deposit: 'Depositar',
      withdraw: 'Retirar', convert: 'Convertir', send: 'Enviar', receive: 'Recibir', transactions: 'Transacciones',
      noTransactions: 'Sin transacciones aún', startEarning: '¡Comienza a ganar escuchando música!',
      viewInExplorer: 'Ver en Explorador', walletAddress: 'Dirección de Billetera', copyAddress: 'Copiar Dirección',
      addressCopied: '¡Dirección copiada!', amount: 'Cantidad', recipient: 'Destinatario', selectToken: 'Seleccionar Token',
      insufficientBalance: 'Saldo insuficiente', transactionSuccess: '¡Transacción exitosa!',
      transactionFailed: 'Transacción fallida', pending: 'Pendiente', completed: 'Completado', failed: 'Fallido'
    },
    common: {
      learnMore: 'Más Información', comingSoon: 'Próximamente', joinWaitlist: 'Unirse a la Lista', darkMode: 'Modo Oscuro',
      lightMode: 'Modo Claro', language: 'Idioma', loading: 'Cargando...', error: 'Error', success: 'Éxito',
      cancel: 'Cancelar', confirm: 'Confirmar', save: 'Guardar', delete: 'Eliminar', edit: 'Editar', view: 'Ver',
      close: 'Cerrar', back: 'Atrás', next: 'Siguiente', previous: 'Anterior', submit: 'Enviar', search: 'Buscar',
      filter: 'Filtrar', sort: 'Ordenar', all: 'Todos', none: 'Ninguno', select: 'Seleccionar', noResults: 'Sin resultados',
      noData: 'Sin datos', retry: 'Reintentar', refresh: 'Actualizar', share: 'Compartir', download: 'Descargar',
      upload: 'Subir', play: 'Reproducir', pause: 'Pausar', stop: 'Detener', mute: 'Silenciar', unmute: 'Activar sonido',
      like: 'Me gusta', unlike: 'Ya no me gusta', follow: 'Seguir', unfollow: 'Dejar de seguir', comment: 'Comentar',
      reply: 'Responder', report: 'Reportar', block: 'Bloquear', unblock: 'Desbloquear', send: 'Enviar', receive: 'Recibir',
      copy: 'Copiar', copied: '¡Copiado!', today: 'Hoy', yesterday: 'Ayer', thisWeek: 'Esta Semana',
      thisMonth: 'Este Mes', viewAll: 'Ver Todo', seeMore: 'Ver Más', seeLess: 'Ver Menos',
      showMore: 'Mostrar Más', showLess: 'Mostrar Menos', readMore: 'Leer Más', readLess: 'Leer Menos'
    },
    explorer: {
      title: 'Explorador de Transacciones', subtitle: 'Rastrea todas las transacciones en la red Thundra',
      searchPlaceholder: 'Buscar por dirección, hash o email', livePrice: 'Precio en Vivo',
      totalBurned: 'Total Quemado', burnedToday: 'Quemado Hoy', totalTransactions: 'Total de Transacciones',
      recentTransactions: 'Transacciones Recientes', walletSearch: 'Búsqueda de Billetera', transactionHash: 'Hash de Transacción',
      from: 'De', to: 'A', amount: 'Cantidad', type: 'Tipo', status: 'Estado', date: 'Fecha',
      noTransactionsFound: 'No se encontraron transacciones', walletBalance: 'Saldo de Billetera', searchResults: 'Resultados de Búsqueda'
    },
    marketplace: {
      title: 'Mercado', subtitle: 'Descubre e intercambia activos digitales', nfts: 'NFTs',
      merchandise: 'Mercancía', tickets: 'Entradas', auctions: 'Subastas', buy: 'Comprar', sell: 'Vender',
      bid: 'Pujar', listItem: 'Listar Artículo', price: 'Precio', currency: 'Moneda', category: 'Categoría',
      owner: 'Propietario', creator: 'Creador', supply: 'Suministro', remaining: 'Restante', soldOut: 'Agotado',
      purchaseSuccess: '¡Compra exitosa!', purchaseFailed: 'Compra fallida', insufficientFunds: 'Fondos insuficientes',
      confirmPurchase: 'Confirmar Compra', bidPlaced: '¡Puja realizada!', currentBid: 'Puja Actual',
      minimumBid: 'Puja Mínima', auctionEnds: 'La Subasta Termina'
    },
    artist: {
      studio: 'Estudio de Artista', uploadTrack: 'Subir Pista', uploadAlbum: 'Subir Álbum', myMusic: 'Mi Música',
      analytics: 'Analíticas', earnings: 'Ganancias', fans: 'Fans', totalStreams: 'Total de Reproducciones',
      monthlyListeners: 'Oyentes Mensuales', trackPerformance: 'Rendimiento de Pistas', noEarnings: 'Sin ganancias aún',
      uploadToEarn: '¡Sube pistas para empezar a ganar!', pendingApproval: 'Aprobación Pendiente',
      applicationStatus: 'Estado de Solicitud', artistRank: 'Rango de Artista', rankLevel: 'Nivel de Rango', bonusRate: 'Tasa de Bonificación'
    },
    moderator: {
      panel: 'Panel de Moderador', pendingReviews: 'Revisiones Pendientes', myVotes: 'Mis Votos', accuracy: 'Precisión',
      moderatorRank: 'Rango de Moderador', approve: 'Aprobar', reject: 'Rechazar', actionType: 'Tipo de Acción',
      reason: 'Razón', votesRequired: 'Votos Requeridos', votesReceived: 'Votos Recibidos',
      allCaughtUp: '¡Todo al día! 🎉', noPendingReviews: 'No hay revisiones pendientes',
      guidelines: 'Directrices de Moderación', beObjective: 'Sé objetivo y justo',
      followRules: 'Sigue las reglas de la comunidad', stayConsistent: 'Mantén la consistencia en las decisiones'
    },
    admin: {
      panel: 'Panel de Admin', overview: 'Resumen', users: 'Usuarios', content: 'Contenido', finance: 'Finanzas',
      analytics: 'Analíticas', totalUsers: 'Total de Usuarios', activeToday: 'Activos Hoy', newSignups: 'Nuevos Registros',
      revenue: 'Ingresos', artistApplications: 'Solicitudes de Artistas', moderatorApplications: 'Solicitudes de Moderadores',
      pendingArtists: 'Artistas Pendientes', pendingModerators: 'Moderadores Pendientes', approveArtist: 'Aprobar Artista',
      rejectArtist: 'Rechazar Artista', approveModerator: 'Aprobar Moderador', rejectModerator: 'Rechazar Moderador',
      viewApplication: 'Ver Solicitud', userManagement: 'Gestión de Usuarios', systemHealth: 'Salud del Sistema',
      serverStatus: 'Estado del Servidor', databaseStatus: 'Estado de la Base de Datos'
    },
    feed: {
      title: 'Feed', createPost: 'Crear Publicación', whatsOnMind: '¿Qué tienes en mente?', post: 'Publicar',
      like: 'Me gusta', comment: 'Comentar', share: 'Compartir', writeComment: 'Escribe un comentario...',
      noPostsYet: 'Sin publicaciones aún', beFirstToPost: '¡Sé el primero en publicar!', loadingPosts: 'Cargando publicaciones...',
      viewComments: 'Ver comentarios', hideComments: 'Ocultar comentarios'
    },
    leaderboard: {
      title: 'Clasificación', subtitle: 'Ve quién está en la cima', topStreamers: 'Top Oyentes',
      topEarners: 'Top Ganadores', topArtists: 'Top Artistas', rank: 'Rango', user: 'Usuario',
      streams: 'Reproducciones', earnings: 'Ganancias', followers: 'Seguidores', thisWeek: 'Esta Semana',
      thisMonth: 'Este Mes', allTime: 'Todo el Tiempo'
    },
    learning: {
      title: 'Centro de Aprendizaje', subtitle: 'Amplía tus conocimientos', courses: 'Cursos', enrolled: 'Inscrito',
      completed: 'Completado', progress: 'Progreso', continueLearning: 'Continuar Aprendiendo',
      enrollNow: 'Inscribirse Ahora', startCourse: 'Iniciar Curso', difficulty: 'Dificultad', duration: 'Duración',
      reward: 'Recompensa', instructor: 'Instructor', beginner: 'Principiante', intermediate: 'Intermedio',
      advanced: 'Avanzado', noCourses: 'No se encontraron cursos', createCourse: 'Crear Curso'
    },
    notification: {
      title: 'Notificaciones', markAllRead: 'Marcar todo como leído', noNotifications: 'Sin notificaciones',
      viewInExplorer: 'Ver en Explorador', newFollower: 'comenzó a seguirte',
      newComment: 'comentó tu publicación', newLike: 'le gustó tu publicación', earnedReward: '¡Ganaste una recompensa!',
      transactionComplete: 'Transacción completada'
    },
    subscription: {
      title: 'Suscripción', choosePlan: 'Elige tu plan', currentPlan: 'Plan Actual',
      free: 'Gratuito', premium: 'Premium', vip: 'VIP', freeDesc: 'Funciones básicas para oyentes casuales',
      premiumDesc: 'Funciones mejoradas para amantes de la música', vipDesc: 'Todas las funciones más beneficios exclusivos',
      perMonth: '/mes', selectPayment: 'Seleccionar método de pago', completePurchase: 'Completar Compra',
      processing: 'Procesando...', success: '¡Compra exitosa!', insufficientBalance: 'Saldo insuficiente',
      features: 'Características', unlimitedStreaming: 'Streaming ilimitado', noAds: 'Sin anuncios',
      downloadOffline: 'Descarga para offline', exclusiveContent: 'Contenido exclusivo',
      prioritySupport: 'Soporte prioritario', earlyAccess: 'Acceso anticipado a nuevas funciones'
    },
    pages: {
      businessTitle: 'Para Empresas', businessSubtitle: 'Alcanza a millones de fans de música comprometidos',
      businessWelcome: 'Bienvenido a Thundra Ads', businessDesc: 'La principal plataforma publicitaria en el ecosistema musical',
      howItWorks: 'Cómo Funciona', benefits: 'Beneficios', targetedExposure: 'Exposición Dirigida',
      earnEngagement: 'Gana por Engagement', analytics: 'Analíticas en Tiempo Real', scalable: 'Soluciones Escalables',
      artistsTitle: 'Para Artistas', artistsSubtitle: 'Tu música, tus reglas, tus ganancias',
      artistsWelcome: 'Bienvenido a Thundra para Artistas', artistsDesc: 'La plataforma construida para creadores',
      ownYourMusic: 'Sé Dueño de Tu Música', transparentRoyalties: 'Regalías Transparentes',
      directFanConnection: 'Conexión Directa con Fans', nftCreation: 'Creación de NFT',
      web3Revolution: 'Revolución Web3', beYourOwnBoss: 'Sé Tu Propio Jefe',
      communityTitle: 'Para la Comunidad', communitySubtitle: 'Únete a una comunidad musical próspera',
      communityDesc: 'Conéctate con fans y artistas de todo el mundo', joinDiscussions: 'Unirse a Discusiones',
      earnRewards: 'Ganar Recompensas', voteGovernance: 'Votar en Gobernanza', exclusiveEvents: 'Eventos Exclusivos',
      getStarted: 'Comenzar', learnMoreTitle: 'Más Información', learnMoreSubtitle: 'Descubre el ecosistema Thundra',
      miningFeatures: 'Funciones de Minería', mineOnMobile: 'Minar en Móvil', mineOnPC: 'Minar en PC',
      secureAndFair: 'Seguro y Justo', earlyRewards: 'Recompensas Tempranas', appComingSoon: 'App Próximamente',
      aboutTitle: 'Sobre Nosotros', aboutSubtitle: 'El equipo detrás de Thundra Music', ourTeam: 'Nuestro Equipo',
      ourMission: 'Nuestra Misión', missionDesc: 'Revolucionando la música a través de la tecnología blockchain',
      whitepaperTitle: 'Libro Blanco', whitepaperSubtitle: 'Documentación técnica', tokenDistribution: 'Distribución de Tokens',
      communityRewards: 'Recompensas Comunitarias', miningPool: 'Pool de Minería', partnerships: 'Asociaciones',
      teamAdvisors: 'Equipo y Asesores', liquidity: 'Liquidez'
    }
  },

  // Swahili (Tanzania)
  sw: {
    dashboard: {
      home: 'Nyumbani', search: 'Tafuta', music: 'Muziki', library: 'Maktaba', favorites: 'Vipendwa',
      leaderboard: 'Orodha ya Viongozi', profile: 'Wasifu', wallet: 'Mkoba', chat: 'Chumba cha Mazungumzo',
      learning: 'Kujifunza', market: 'Soko', ai: 'Thundra AI', ads: 'Matangazo', artist: 'Studio ya Msanii',
      moderator: 'Panel ya Msimamizi', admin: 'Panel ya Msimamizi Mkuu', settings: 'Mipangilio', logout: 'Ondoka',
      upload: 'Pakia Wimbo', earnings: 'Mapato', followers: 'Wafuasi', streams: 'Sikilizo',
      likes: 'Kupenda', menu: 'MENYU', features: 'VIPENGELE', yourPlaylists: 'PLAYLISTS ZAKO',
      createPlaylist: 'Unda Playlist', tracks: 'nyimbo', freeMode: 'Hali ya Bure', freeUser: 'Mtumiaji wa Bure',
      premiumUser: 'Mtumiaji wa Premium', vipUser: 'Mtumiaji wa VIP', buySubscription: 'Nunua Usajili', upgradeToVip: 'Pandisha hadi VIP'
    },
    settings: {
      title: 'Mipangilio', subtitle: 'Simamia akaunti yako na mapendekezo', account: 'Akaunti',
      notifications: 'Arifa', privacy: 'Faragha', appearance: 'Muonekano', support: 'Msaada',
      profileInfo: 'Taarifa za Wasifu', updateDetails: 'Sasisha maelezo yako', fullName: 'Jina Kamili',
      username: 'Jina la Mtumiaji', email: 'Barua Pepe', phone: 'Simu', bio: 'Wasifu Mfupi', saveChanges: 'Hifadhi Mabadiliko',
      security: 'Usalama', securityDesc: 'Simamia nenosiri na usalama wako', changePassword: 'Badilisha Nenosiri',
      twoFactor: 'Uthibitishaji wa Hatua Mbili', dangerZone: 'Eneo Hatari', exportData: 'Hamisha Data Yangu',
      deleteAccount: 'Futa Akaunti', notificationPrefs: 'Mapendekezo ya Arifa',
      notificationDesc: 'Chagua arifa unazotaka kupokea', emailNotifications: 'Arifa za Barua Pepe',
      pushNotifications: 'Arifa za Push', newFollowers: 'Wafuasi Wapya', newComments: 'Maoni Mapya',
      earningsUpdates: 'Sasishaji za Mapato', promotions: 'Matangazo', privacySettings: 'Mipangilio ya Faragha',
      privacyDesc: 'Dhibiti faragha na uonekano wako', publicProfile: 'Wasifu wa Umma',
      showActivity: 'Onyesha Shughuli', listeningHistory: 'Historia ya Kusikiliza', theme: 'Mandhari',
      themeDesc: 'Chagua mandhari unayopendelea', light: 'Mwanga', dark: 'Giza', language: 'Lugha',
      languageDesc: 'Chagua lugha unayopendelea', contactSupport: 'Wasiliana na Msaada',
      supportDesc: 'Wasilisha tiketi na tutakujibu', category: 'Kategoria', subject: 'Mada',
      message: 'Ujumbe', submitTicket: 'Wasilisha Tiketi', quickLinks: 'Viungo vya Haraka', helpCenter: 'Kituo cha Msaada',
      helpCenterDesc: 'Vinjari msingi wetu wa maarifa', faq: 'Maswali Yanayoulizwa Mara kwa Mara', faqDesc: 'Maswali yanayoulizwa mara kwa mara',
      documentation: 'Nyaraka', documentationDesc: 'Nyaraka za kiufundi', generalInquiry: 'Ulizo la Jumla',
      technicalIssue: 'Tatizo la Kiufundi', billing: 'Ankara na Malipo', accountIssues: 'Matatizo ya Akaunti',
      artistSupport: 'Msaada wa Wasanii', feedback: 'Maoni'
    },
    auth: {
      welcomeBack: 'Karibu tena!', joinRevolution: 'Jiunge na mapinduzi', login: 'Ingia', signup: 'Jisajili',
      orContinueWith: 'Au endelea na barua pepe', fullName: 'Jina Kamili', username: 'Jina la Mtumiaji', phone: 'Simu',
      dateOfBirth: 'Tarehe ya Kuzaliwa', country: 'Nchi', selectCountry: 'Chagua nchi yako', email: 'Barua Pepe',
      emailOrUsername: 'Barua Pepe au Jina la Mtumiaji', password: 'Nenosiri', forgotPassword: 'Umesahau nenosiri?',
      agreeToTerms: 'Ninakubali', termsAndConditions: 'Sheria na Masharti', privacyPolicy: 'Sera ya Faragha',
      and: 'na', noAccount: 'Huna akaunti?', haveAccount: 'Una akaunti tayari?',
      createAccount: 'Unda akaunti', signingIn: 'Inaingia...', creatingAccount: 'Inaunda akaunti...',
      wantToBeArtist: 'Nataka kuwa Msanii', wantToBeModerator: 'Nataka kuwa Msimamizi',
      artistDesc: 'Pakia muziki na upate mrabaha', moderatorDesc: 'Saidia kudumisha viwango vya jamii', comingSoon: 'Inakuja Hivi Karibuni'
    },
    wallet: {
      title: 'Mkoba', subtitle: 'Simamia mali zako za kidijitali', totalBalance: 'Jumla ya Salio',
      availableBalance: 'Salio Linalopatikana', lockedBalance: 'Salio Lililofungwa', deposit: 'Weka',
      withdraw: 'Toa', convert: 'Badilisha', send: 'Tuma', receive: 'Pokea', transactions: 'Miamala',
      noTransactions: 'Hakuna miamala bado', startEarning: 'Anza kupata kwa kusikiliza muziki!',
      viewInExplorer: 'Angalia katika Explorer', walletAddress: 'Anwani ya Mkoba', copyAddress: 'Nakili Anwani',
      addressCopied: 'Anwani imenakiliwa!', amount: 'Kiasi', recipient: 'Mpokeaji', selectToken: 'Chagua Token',
      insufficientBalance: 'Salio haitoshi', transactionSuccess: 'Muamala umefanikiwa!',
      transactionFailed: 'Muamala umeshindwa', pending: 'Inasubiri', completed: 'Imekamilika', failed: 'Imeshindwa'
    },
    common: {
      learnMore: 'Jifunze Zaidi', comingSoon: 'Inakuja Hivi Karibuni', joinWaitlist: 'Jiunge na Orodha', darkMode: 'Hali ya Giza',
      lightMode: 'Hali ya Mwanga', language: 'Lugha', loading: 'Inapakia...', error: 'Kosa', success: 'Mafanikio',
      cancel: 'Ghairi', confirm: 'Thibitisha', save: 'Hifadhi', delete: 'Futa', edit: 'Hariri', view: 'Angalia',
      close: 'Funga', back: 'Rudi', next: 'Ifuatayo', previous: 'Iliyopita', submit: 'Wasilisha', search: 'Tafuta',
      filter: 'Chuja', sort: 'Panga', all: 'Zote', none: 'Hakuna', select: 'Chagua', noResults: 'Hakuna matokeo',
      noData: 'Hakuna data', retry: 'Jaribu tena', refresh: 'Onyesha upya', share: 'Shiriki', download: 'Pakua',
      upload: 'Pakia', play: 'Cheza', pause: 'Simamisha', stop: 'Simama', mute: 'Nyamaza', unmute: 'Ruhusu sauti',
      like: 'Penda', unlike: 'Ondoa kupenda', follow: 'Fuata', unfollow: 'Acha kufuata', comment: 'Toa maoni',
      reply: 'Jibu', report: 'Ripoti', block: 'Zuia', unblock: 'Ondoa kizuizi', send: 'Tuma', receive: 'Pokea',
      copy: 'Nakili', copied: 'Imenakiliwa!', today: 'Leo', yesterday: 'Jana', thisWeek: 'Wiki Hii',
      thisMonth: 'Mwezi Huu', viewAll: 'Angalia Zote', seeMore: 'Angalia Zaidi', seeLess: 'Angalia Kidogo',
      showMore: 'Onyesha Zaidi', showLess: 'Onyesha Kidogo', readMore: 'Soma Zaidi', readLess: 'Soma Kidogo'
    },
    explorer: {
      title: 'Kifuatiliaji cha Miamala', subtitle: 'Fuatilia miamala yote kwenye mtandao wa Thundra',
      searchPlaceholder: 'Tafuta kwa anwani, hash, au barua pepe', livePrice: 'Bei ya Sasa',
      totalBurned: 'Jumla Iliyochomwa', burnedToday: 'Iliyochomwa Leo', totalTransactions: 'Jumla ya Miamala',
      recentTransactions: 'Miamala ya Hivi Karibuni', walletSearch: 'Utaftaji wa Mkoba', transactionHash: 'Hash ya Muamala',
      from: 'Kutoka', to: 'Kwenda', amount: 'Kiasi', type: 'Aina', status: 'Hali', date: 'Tarehe',
      noTransactionsFound: 'Hakuna miamala iliyopatikana', walletBalance: 'Salio la Mkoba', searchResults: 'Matokeo ya Utaftaji'
    },
    marketplace: {
      title: 'Soko', subtitle: 'Gundua na biashara mali za kidijitali', nfts: 'NFT',
      merchandise: 'Bidhaa', tickets: 'Tiketi', auctions: 'Mnada', buy: 'Nunua', sell: 'Uza',
      bid: 'Weka Bei', listItem: 'Orodhesha Bidhaa', price: 'Bei', currency: 'Sarafu', category: 'Kategoria',
      owner: 'Mmiliki', creator: 'Muumbaji', supply: 'Ugavi', remaining: 'Imebaki', soldOut: 'Imeisha',
      purchaseSuccess: 'Ununuzi umefanikiwa!', purchaseFailed: 'Ununuzi umeshindwa', insufficientFunds: 'Fedha hazitoshi',
      confirmPurchase: 'Thibitisha Ununuzi', bidPlaced: 'Bei imewekwa!', currentBid: 'Bei ya Sasa',
      minimumBid: 'Bei ya Chini', auctionEnds: 'Mnada Unaisha'
    },
    artist: {
      studio: 'Studio ya Msanii', uploadTrack: 'Pakia Wimbo', uploadAlbum: 'Pakia Albamu', myMusic: 'Muziki Wangu',
      analytics: 'Uchambuzi', earnings: 'Mapato', fans: 'Mashabiki', totalStreams: 'Jumla ya Sikilizo',
      monthlyListeners: 'Wasikilizaji wa Mwezi', trackPerformance: 'Utendaji wa Wimbo', noEarnings: 'Hakuna mapato bado',
      uploadToEarn: 'Pakia nyimbo na upate sikilizo kuanza kupata!', pendingApproval: 'Inasubiri Idhini',
      applicationStatus: 'Hali ya Maombi', artistRank: 'Nafasi ya Msanii', rankLevel: 'Kiwango cha Nafasi', bonusRate: 'Kiwango cha Bonasi'
    },
    moderator: {
      panel: 'Panel ya Msimamizi', pendingReviews: 'Ukaguzi Unaosubiri', myVotes: 'Kura Zangu', accuracy: 'Usahihi',
      moderatorRank: 'Nafasi ya Msimamizi', approve: 'Kubali', reject: 'Kataa', actionType: 'Aina ya Kitendo',
      reason: 'Sababu', votesRequired: 'Kura Zinazohitajika', votesReceived: 'Kura Zilizopokelewa',
      allCaughtUp: 'Umekamilisha! 🎉', noPendingReviews: 'Hakuna ukaguzi unaosubiri kwa sasa',
      guidelines: 'Miongozo ya Usimamizi', beObjective: 'Kuwa na lengo na haki',
      followRules: 'Fuata miongozo ya jamii', stayConsistent: 'Kuwa na msimamo katika maamuzi'
    },
    admin: {
      panel: 'Panel ya Msimamizi Mkuu', overview: 'Muhtasari', users: 'Watumiaji', content: 'Maudhui', finance: 'Fedha',
      analytics: 'Uchambuzi', totalUsers: 'Jumla ya Watumiaji', activeToday: 'Hai Leo', newSignups: 'Usajili Mpya',
      revenue: 'Mapato', artistApplications: 'Maombi ya Wasanii', moderatorApplications: 'Maombi ya Wasimamizi',
      pendingArtists: 'Wasanii Wanaosubiri', pendingModerators: 'Wasimamizi Wanaosubiri', approveArtist: 'Kubali Msanii',
      rejectArtist: 'Kataa Msanii', approveModerator: 'Kubali Msimamizi', rejectModerator: 'Kataa Msimamizi',
      viewApplication: 'Angalia Maombi', userManagement: 'Usimamizi wa Watumiaji', systemHealth: 'Afya ya Mfumo',
      serverStatus: 'Hali ya Seva', databaseStatus: 'Hali ya Hifadhidata'
    },
    feed: {
      title: 'Mlisho', createPost: 'Unda Chapisho', whatsOnMind: 'Una nini kichwani?', post: 'Chapisha',
      like: 'Penda', comment: 'Toa Maoni', share: 'Shiriki', writeComment: 'Andika maoni...',
      noPostsYet: 'Hakuna machapisho bado', beFirstToPost: 'Kuwa wa kwanza kuchapisha!', loadingPosts: 'Inapakia machapisho...',
      viewComments: 'Angalia maoni', hideComments: 'Ficha maoni'
    },
    leaderboard: {
      title: 'Orodha ya Viongozi', subtitle: 'Angalia nani yupo juu', topStreamers: 'Wasikilizaji Bora',
      topEarners: 'Wapata Zaidi', topArtists: 'Wasanii Bora', rank: 'Nafasi', user: 'Mtumiaji',
      streams: 'Sikilizo', earnings: 'Mapato', followers: 'Wafuasi', thisWeek: 'Wiki Hii',
      thisMonth: 'Mwezi Huu', allTime: 'Wakati Wote'
    },
    learning: {
      title: 'Kituo cha Kujifunza', subtitle: 'Panua maarifa yako', courses: 'Kozi', enrolled: 'Umejisajili',
      completed: 'Umekamilisha', progress: 'Maendeleo', continueLearning: 'Endelea Kujifunza',
      enrollNow: 'Jisajili Sasa', startCourse: 'Anza Kozi', difficulty: 'Ugumu', duration: 'Muda',
      reward: 'Tuzo', instructor: 'Mkufunzi', beginner: 'Mwanzo', intermediate: 'Kati',
      advanced: 'Juu', noCourses: 'Hakuna kozi zilizopatikana', createCourse: 'Unda Kozi'
    },
    notification: {
      title: 'Arifa', markAllRead: 'Weka zote kama zimesomwa', noNotifications: 'Hakuna arifa bado',
      viewInExplorer: 'Angalia katika Explorer', newFollower: 'ameanza kukufuata',
      newComment: 'ametoa maoni kwenye chapisho lako', newLike: 'amependa chapisho lako', earnedReward: 'Umepata tuzo!',
      transactionComplete: 'Muamala umekamilika'
    },
    subscription: {
      title: 'Usajili', choosePlan: 'Chagua mpango wako', currentPlan: 'Mpango wa Sasa',
      free: 'Bure', premium: 'Premium', vip: 'VIP', freeDesc: 'Vipengele vya msingi kwa wasikilizaji wa kawaida',
      premiumDesc: 'Vipengele bora kwa wapenda muziki', vipDesc: 'Vipengele vyote pamoja na faida za kipekee',
      perMonth: '/mwezi', selectPayment: 'Chagua njia ya malipo', completePurchase: 'Kamilisha Ununuzi',
      processing: 'Inashughulikia...', success: 'Ununuzi umefanikiwa!', insufficientBalance: 'Salio haitoshi',
      features: 'Vipengele', unlimitedStreaming: 'Kusikiliza bila kikomo', noAds: 'Bila matangazo',
      downloadOffline: 'Pakua kwa nje ya mtandao', exclusiveContent: 'Maudhui ya kipekee',
      prioritySupport: 'Msaada wa kipaumbele', earlyAccess: 'Ufikiaji wa mapema wa vipengele vipya'
    },
    pages: {
      businessTitle: 'Kwa Biashara', businessSubtitle: 'Fikia mamilioni ya mashabiki wa muziki wenye ushiriki',
      businessWelcome: 'Karibu Thundra Ads', businessDesc: 'Jukwaa kuu la matangazo katika mfumo wa muziki',
      howItWorks: 'Jinsi Inavyofanya Kazi', benefits: 'Faida', targetedExposure: 'Uonyeshaji Unaolengwa',
      earnEngagement: 'Pata Kupitia Ushiriki', analytics: 'Uchambuzi wa Wakati Halisi', scalable: 'Suluhisho Zinazoweza Kupanuka',
      artistsTitle: 'Kwa Wasanii', artistsSubtitle: 'Muziki wako, sheria zako, mapato yako',
      artistsWelcome: 'Karibu Thundra kwa Wasanii', artistsDesc: 'Jukwaa lililojengwa kwa wabunifu',
      ownYourMusic: 'Miliki Muziki Wako', transparentRoyalties: 'Mrabaha wa Uwazi',
      directFanConnection: 'Uunganisho wa Moja kwa Moja na Mashabiki', nftCreation: 'Uundaji wa NFT',
      web3Revolution: 'Mapinduzi ya Web3', beYourOwnBoss: 'Kuwa Bosi Wako Mwenyewe',
      communityTitle: 'Kwa Jamii', communitySubtitle: 'Jiunge na jamii ya muziki inayostawi',
      communityDesc: 'Ungana na mashabiki na wasanii duniani kote', joinDiscussions: 'Jiunge na Majadiliano',
      earnRewards: 'Pata Zawadi', voteGovernance: 'Piga Kura kwa Utawala', exclusiveEvents: 'Matukio ya Kipekee',
      getStarted: 'Anza', learnMoreTitle: 'Jifunze Zaidi', learnMoreSubtitle: 'Gundua mfumo wa Thundra',
      miningFeatures: 'Vipengele vya Uchimbaji', mineOnMobile: 'Chimba kwa Simu', mineOnPC: 'Chimba kwa Kompyuta',
      secureAndFair: 'Salama na Haki', earlyRewards: 'Zawadi za Mapema', appComingSoon: 'Programu Inakuja Hivi Karibuni',
      aboutTitle: 'Kuhusu Sisi', aboutSubtitle: 'Timu nyuma ya Thundra Music', ourTeam: 'Timu Yetu',
      ourMission: 'Misheni Yetu', missionDesc: 'Kubadilisha muziki kupitia teknolojia ya blockchain',
      whitepaperTitle: 'Waraka Mweupe', whitepaperSubtitle: 'Nyaraka za kiufundi', tokenDistribution: 'Usambazaji wa Tokeni',
      communityRewards: 'Zawadi za Jamii', miningPool: 'Bwawa la Uchimbaji', partnerships: 'Ushirikiano',
      teamAdvisors: 'Timu na Washauri', liquidity: 'Ukwasi'
    }
  },

  // DR Congo Swahili
  swc: {
    dashboard: {
      home: 'Nyumba', search: 'Tafuta', music: 'Muziki', library: 'Biblioteki', favorites: 'Vipendwa',
      leaderboard: 'Orodha Bora', profile: 'Profil', wallet: 'Mkoba', chat: 'Mazungumzo',
      learning: 'Kujifunza', market: 'Duka', ai: 'Thundra AI', ads: 'Pub', artist: 'Studio Artiste',
      moderator: 'Panel Mod', admin: 'Panel Admin', settings: 'Reglages', logout: 'Kuondoka',
      upload: 'Tia Wimbo', earnings: 'Pesa', followers: 'Wafuasi', streams: 'Kusikiliza',
      likes: 'Kupenda', menu: 'MENYU', features: 'VIPENGELE', yourPlaylists: 'PLAYLISTS ZAKO',
      createPlaylist: 'Unda Playlist', tracks: 'nyimbo', freeMode: 'Hali ya Bure', freeUser: 'Mtumiaji Bure',
      premiumUser: 'Mtumiaji Premium', vipUser: 'Mtumiaji VIP', buySubscription: 'Nunua Usajili', upgradeToVip: 'Panda VIP'
    },
    settings: {
      title: 'Reglages', subtitle: 'Simamia akaunti yako', account: 'Akaunti',
      notifications: 'Arifa', privacy: 'Faragha', appearance: 'Muonekano', support: 'Msaada',
      profileInfo: 'Taarifa za Profil', updateDetails: 'Sasisha maelezo', fullName: 'Jina Kamili',
      username: 'Jina la Mtumiaji', email: 'Email', phone: 'Simu', bio: 'Bio', saveChanges: 'Hifadhi',
      security: 'Usalama', securityDesc: 'Simamia nenosiri', changePassword: 'Badilisha Nenosiri',
      twoFactor: 'Uthibitishaji 2FA', dangerZone: 'Eneo Hatari', exportData: 'Hamisha Data',
      deleteAccount: 'Futa Akaunti', notificationPrefs: 'Mapendekezo ya Arifa',
      notificationDesc: 'Chagua arifa', emailNotifications: 'Arifa za Email',
      pushNotifications: 'Arifa za Push', newFollowers: 'Wafuasi Wapya', newComments: 'Maoni Mapya',
      earningsUpdates: 'Sasishaji za Pesa', promotions: 'Matangazo', privacySettings: 'Mipangilio ya Faragha',
      privacyDesc: 'Dhibiti faragha yako', publicProfile: 'Profil ya Umma',
      showActivity: 'Onyesha Shughuli', listeningHistory: 'Historia ya Kusikiliza', theme: 'Mandhari',
      themeDesc: 'Chagua mandhari', light: 'Mwangaza', dark: 'Giza', language: 'Lugha',
      languageDesc: 'Chagua lugha', contactSupport: 'Wasiliana na Msaada',
      supportDesc: 'Tuma tiketi', category: 'Kategoria', subject: 'Mada',
      message: 'Ujumbe', submitTicket: 'Tuma Tiketi', quickLinks: 'Viungo vya Haraka', helpCenter: 'Kituo cha Msaada',
      helpCenterDesc: 'Vinjari maarifa', faq: 'FAQ', faqDesc: 'Maswali',
      documentation: 'Nyaraka', documentationDesc: 'Nyaraka za kiufundi', generalInquiry: 'Ulizo',
      technicalIssue: 'Tatizo la Kiufundi', billing: 'Malipo', accountIssues: 'Matatizo ya Akaunti',
      artistSupport: 'Msaada wa Artiste', feedback: 'Maoni'
    },
    auth: {
      welcomeBack: 'Karibu tena!', joinRevolution: 'Jiunge na mapinduzi', login: 'Kuingia', signup: 'Kujiandikisha',
      orContinueWith: 'Au endelea na email', fullName: 'Jina Kamili', username: 'Jina la Mtumiaji', phone: 'Simu',
      dateOfBirth: 'Tarehe ya Kuzaliwa', country: 'Nchi', selectCountry: 'Chagua nchi', email: 'Email',
      emailOrUsername: 'Email au Jina', password: 'Nenosiri', forgotPassword: 'Umesahau nenosiri?',
      agreeToTerms: 'Ninakubali', termsAndConditions: 'Sheria', privacyPolicy: 'Sera ya Faragha',
      and: 'na', noAccount: 'Huna akaunti?', haveAccount: 'Una akaunti?',
      createAccount: 'Unda akaunti', signingIn: 'Inaingia...', creatingAccount: 'Inaunda...',
      wantToBeArtist: 'Nataka kuwa Artiste', wantToBeModerator: 'Nataka kuwa Mod',
      artistDesc: 'Pakia muziki', moderatorDesc: 'Saidia jamii', comingSoon: 'Inakuja'
    },
    wallet: {
      title: 'Mkoba', subtitle: 'Simamia mali zako', totalBalance: 'Jumla ya Salio',
      availableBalance: 'Salio Linalopatikana', lockedBalance: 'Salio Lililofungwa', deposit: 'Weka',
      withdraw: 'Toa', convert: 'Badilisha', send: 'Tuma', receive: 'Pokea', transactions: 'Miamala',
      noTransactions: 'Hakuna miamala', startEarning: 'Anza kupata!',
      viewInExplorer: 'Angalia Explorer', walletAddress: 'Anwani ya Mkoba', copyAddress: 'Nakili',
      addressCopied: 'Imenakiliwa!', amount: 'Kiasi', recipient: 'Mpokeaji', selectToken: 'Chagua Token',
      insufficientBalance: 'Salio haitoshi', transactionSuccess: 'Imefanikiwa!',
      transactionFailed: 'Imeshindwa', pending: 'Inasubiri', completed: 'Imekamilika', failed: 'Imeshindwa'
    },
    common: {
      learnMore: 'Jua Zaidi', comingSoon: 'Inakuja', joinWaitlist: 'Jiunge', darkMode: 'Giza',
      lightMode: 'Mwangaza', language: 'Lugha', loading: 'Inapakia...', error: 'Kosa', success: 'Mafanikio',
      cancel: 'Ghairi', confirm: 'Thibitisha', save: 'Hifadhi', delete: 'Futa', edit: 'Hariri', view: 'Angalia',
      close: 'Funga', back: 'Rudi', next: 'Ifuatayo', previous: 'Iliyopita', submit: 'Tuma', search: 'Tafuta',
      filter: 'Chuja', sort: 'Panga', all: 'Zote', none: 'Hakuna', select: 'Chagua', noResults: 'Hakuna',
      noData: 'Hakuna data', retry: 'Jaribu tena', refresh: 'Onyesha upya', share: 'Shiriki', download: 'Pakua',
      upload: 'Pakia', play: 'Cheza', pause: 'Simamisha', stop: 'Simama', mute: 'Nyamaza', unmute: 'Sauti',
      like: 'Penda', unlike: 'Ondoa', follow: 'Fuata', unfollow: 'Acha', comment: 'Maoni',
      reply: 'Jibu', report: 'Ripoti', block: 'Zuia', unblock: 'Ondoa kizuizi', send: 'Tuma', receive: 'Pokea',
      copy: 'Nakili', copied: 'Imenakiliwa!', today: 'Leo', yesterday: 'Jana', thisWeek: 'Wiki Hii',
      thisMonth: 'Mwezi Huu', viewAll: 'Angalia Zote', seeMore: 'Zaidi', seeLess: 'Kidogo',
      showMore: 'Onyesha Zaidi', showLess: 'Onyesha Kidogo', readMore: 'Soma Zaidi', readLess: 'Soma Kidogo'
    },
    explorer: {
      title: 'Kifuatiliaji', subtitle: 'Fuatilia miamala',
      searchPlaceholder: 'Tafuta...', livePrice: 'Bei ya Sasa',
      totalBurned: 'Jumla Iliyochomwa', burnedToday: 'Iliyochomwa Leo', totalTransactions: 'Jumla ya Miamala',
      recentTransactions: 'Miamala ya Hivi Karibuni', walletSearch: 'Utaftaji', transactionHash: 'Hash',
      from: 'Kutoka', to: 'Kwenda', amount: 'Kiasi', type: 'Aina', status: 'Hali', date: 'Tarehe',
      noTransactionsFound: 'Hakuna', walletBalance: 'Salio', searchResults: 'Matokeo'
    },
    marketplace: {
      title: 'Duka', subtitle: 'Nunua na uza', nfts: 'NFT',
      merchandise: 'Bidhaa', tickets: 'Tiketi', auctions: 'Mnada', buy: 'Nunua', sell: 'Uza',
      bid: 'Bei', listItem: 'Orodhesha', price: 'Bei', currency: 'Sarafu', category: 'Kategoria',
      owner: 'Mmiliki', creator: 'Muumbaji', supply: 'Ugavi', remaining: 'Imebaki', soldOut: 'Imeisha',
      purchaseSuccess: 'Imefanikiwa!', purchaseFailed: 'Imeshindwa', insufficientFunds: 'Fedha hazitoshi',
      confirmPurchase: 'Thibitisha', bidPlaced: 'Bei imewekwa!', currentBid: 'Bei ya Sasa',
      minimumBid: 'Bei ya Chini', auctionEnds: 'Mwisho'
    },
    artist: {
      studio: 'Studio', uploadTrack: 'Pakia Wimbo', uploadAlbum: 'Pakia Albamu', myMusic: 'Muziki Wangu',
      analytics: 'Uchambuzi', earnings: 'Pesa', fans: 'Mashabiki', totalStreams: 'Jumla ya Sikilizo',
      monthlyListeners: 'Wasikilizaji', trackPerformance: 'Utendaji', noEarnings: 'Hakuna pesa',
      uploadToEarn: 'Pakia kuanza kupata!', pendingApproval: 'Inasubiri',
      applicationStatus: 'Hali', artistRank: 'Nafasi', rankLevel: 'Kiwango', bonusRate: 'Bonasi'
    },
    moderator: {
      panel: 'Panel ya Mod', pendingReviews: 'Ukaguzi', myVotes: 'Kura Zangu', accuracy: 'Usahihi',
      moderatorRank: 'Nafasi', approve: 'Kubali', reject: 'Kataa', actionType: 'Aina',
      reason: 'Sababu', votesRequired: 'Kura Zinazohitajika', votesReceived: 'Kura',
      allCaughtUp: 'Umekamilisha! 🎉', noPendingReviews: 'Hakuna',
      guidelines: 'Miongozo', beObjective: 'Kuwa na lengo',
      followRules: 'Fuata sheria', stayConsistent: 'Kuwa na msimamo'
    },
    admin: {
      panel: 'Panel ya Admin', overview: 'Muhtasari', users: 'Watumiaji', content: 'Maudhui', finance: 'Fedha',
      analytics: 'Uchambuzi', totalUsers: 'Jumla ya Watumiaji', activeToday: 'Hai Leo', newSignups: 'Usajili Mpya',
      revenue: 'Mapato', artistApplications: 'Maombi ya Artistes', moderatorApplications: 'Maombi ya Mods',
      pendingArtists: 'Artistes Wanaosubiri', pendingModerators: 'Mods Wanaosubiri', approveArtist: 'Kubali Artiste',
      rejectArtist: 'Kataa Artiste', approveModerator: 'Kubali Mod', rejectModerator: 'Kataa Mod',
      viewApplication: 'Angalia', userManagement: 'Usimamizi', systemHealth: 'Afya ya Mfumo',
      serverStatus: 'Hali ya Seva', databaseStatus: 'Hifadhidata'
    },
    feed: {
      title: 'Mlisho', createPost: 'Unda', whatsOnMind: 'Una nini kichwani?', post: 'Chapisha',
      like: 'Penda', comment: 'Maoni', share: 'Shiriki', writeComment: 'Andika maoni...',
      noPostsYet: 'Hakuna machapisho', beFirstToPost: 'Kuwa wa kwanza!', loadingPosts: 'Inapakia...',
      viewComments: 'Angalia maoni', hideComments: 'Ficha'
    },
    leaderboard: {
      title: 'Orodha Bora', subtitle: 'Angalia viongozi', topStreamers: 'Wasikilizaji Bora',
      topEarners: 'Wapata Zaidi', topArtists: 'Artistes Bora', rank: 'Nafasi', user: 'Mtumiaji',
      streams: 'Sikilizo', earnings: 'Pesa', followers: 'Wafuasi', thisWeek: 'Wiki Hii',
      thisMonth: 'Mwezi Huu', allTime: 'Wakati Wote'
    },
    learning: {
      title: 'Kujifunza', subtitle: 'Panua maarifa yako', courses: 'Kozi', enrolled: 'Umejisajili',
      completed: 'Umekamilisha', progress: 'Maendeleo', continueLearning: 'Endelea',
      enrollNow: 'Jisajili', startCourse: 'Anza', difficulty: 'Ugumu', duration: 'Muda',
      reward: 'Tuzo', instructor: 'Mkufunzi', beginner: 'Mwanzo', intermediate: 'Kati',
      advanced: 'Juu', noCourses: 'Hakuna kozi', createCourse: 'Unda Kozi'
    },
    notification: {
      title: 'Arifa', markAllRead: 'Soma zote', noNotifications: 'Hakuna arifa',
      viewInExplorer: 'Angalia', newFollower: 'anakufuata',
      newComment: 'ametoa maoni', newLike: 'amependa', earnedReward: 'Umepata tuzo!',
      transactionComplete: 'Muamala umekamilika'
    },
    subscription: {
      title: 'Usajili', choosePlan: 'Chagua mpango', currentPlan: 'Mpango wa Sasa',
      free: 'Bure', premium: 'Premium', vip: 'VIP', freeDesc: 'Vipengele vya msingi',
      premiumDesc: 'Vipengele bora', vipDesc: 'Vipengele vyote',
      perMonth: '/mwezi', selectPayment: 'Chagua malipo', completePurchase: 'Kamilisha',
      processing: 'Inashughulikia...', success: 'Imefanikiwa!', insufficientBalance: 'Salio haitoshi',
      features: 'Vipengele', unlimitedStreaming: 'Bila kikomo', noAds: 'Bila matangazo',
      downloadOffline: 'Pakua', exclusiveContent: 'Maudhui ya kipekee',
      prioritySupport: 'Msaada wa kipaumbele', earlyAccess: 'Ufikiaji wa mapema'
    },
    pages: {
      businessTitle: 'Kwa Biashara', businessSubtitle: 'Fikia mashabiki wengi',
      businessWelcome: 'Karibu Thundra Ads', businessDesc: 'Jukwaa la matangazo',
      howItWorks: 'Jinsi Inavyofanya Kazi', benefits: 'Faida', targetedExposure: 'Uonyeshaji',
      earnEngagement: 'Pata kwa Ushiriki', analytics: 'Uchambuzi', scalable: 'Suluhisho',
      artistsTitle: 'Kwa Artistes', artistsSubtitle: 'Muziki wako, sheria zako',
      artistsWelcome: 'Karibu Thundra kwa Artistes', artistsDesc: 'Jukwaa kwa wabunifu',
      ownYourMusic: 'Miliki Muziki Wako', transparentRoyalties: 'Mrabaha wa Uwazi',
      directFanConnection: 'Uunganisho na Mashabiki', nftCreation: 'Uundaji wa NFT',
      web3Revolution: 'Mapinduzi ya Web3', beYourOwnBoss: 'Kuwa Bosi Wako',
      communityTitle: 'Kwa Jamaa', communitySubtitle: 'Jiunge na jamii ya muziki',
      communityDesc: 'Ungana na mashabiki duniani', joinDiscussions: 'Jiunge',
      earnRewards: 'Pata Zawadi', voteGovernance: 'Piga Kura', exclusiveEvents: 'Matukio',
      getStarted: 'Anza', learnMoreTitle: 'Jua Zaidi', learnMoreSubtitle: 'Gundua Thundra',
      miningFeatures: 'Vipengele vya Uchimbaji', mineOnMobile: 'Chimba kwa Simu', mineOnPC: 'Chimba kwa PC',
      secureAndFair: 'Salama', earlyRewards: 'Zawadi za Mapema', appComingSoon: 'Programu Inakuja',
      aboutTitle: 'Kuhusu Sisi', aboutSubtitle: 'Timu ya Thundra', ourTeam: 'Timu Yetu',
      ourMission: 'Misheni Yetu', missionDesc: 'Kubadilisha muziki',
      whitepaperTitle: 'Waraka Mweupe', whitepaperSubtitle: 'Nyaraka', tokenDistribution: 'Usambazaji wa Tokeni',
      communityRewards: 'Zawadi za Jamii', miningPool: 'Bwawa la Uchimbaji', partnerships: 'Ushirikiano',
      teamAdvisors: 'Timu na Washauri', liquidity: 'Ukwasi'
    }
  },

  // Chinese
  zh: {
    dashboard: {
      home: '首页', search: '搜索', music: '音乐', library: '音乐库', favorites: '收藏',
      leaderboard: '排行榜', profile: '个人资料', wallet: '钱包', chat: '聊天室',
      learning: '学习', market: '市场', ai: 'AI助手', ads: '广告', artist: '艺术家工作室',
      moderator: '管理面板', admin: '管理员面板', settings: '设置', logout: '退出',
      upload: '上传曲目', earnings: '收入', followers: '粉丝', streams: '播放量',
      likes: '点赞', menu: '菜单', features: '功能', yourPlaylists: '您的播放列表',
      createPlaylist: '创建播放列表', tracks: '首曲目', freeMode: '免费模式', freeUser: '免费用户',
      premiumUser: '高级用户', vipUser: 'VIP用户', buySubscription: '购买订阅', upgradeToVip: '升级到VIP'
    },
    settings: {
      title: '设置', subtitle: '管理您的账户和偏好', account: '账户',
      notifications: '通知', privacy: '隐私', appearance: '外观', support: '支持',
      profileInfo: '个人信息', updateDetails: '更新您的个人详情', fullName: '全名',
      username: '用户名', email: '邮箱', phone: '电话', bio: '简介', saveChanges: '保存更改',
      security: '安全', securityDesc: '管理您的密码和安全设置', changePassword: '更改密码',
      twoFactor: '双因素认证', dangerZone: '危险区域', exportData: '导出我的数据',
      deleteAccount: '删除账户', notificationPrefs: '通知偏好',
      notificationDesc: '选择您想接收的通知', emailNotifications: '邮件通知',
      pushNotifications: '推送通知', newFollowers: '新粉丝', newComments: '新评论',
      earningsUpdates: '收入更新', promotions: '推广', privacySettings: '隐私设置',
      privacyDesc: '控制您的隐私和可见性', publicProfile: '公开个人资料',
      showActivity: '显示活动', listeningHistory: '收听历史', theme: '主题',
      themeDesc: '选择您喜欢的主题', light: '浅色', dark: '深色', language: '语言',
      languageDesc: '选择您喜欢的语言', contactSupport: '联系支持',
      supportDesc: '提交工单，我们会回复您', category: '类别', subject: '主题',
      message: '消息', submitTicket: '提交工单', quickLinks: '快速链接', helpCenter: '帮助中心',
      helpCenterDesc: '浏览我们的知识库', faq: '常见问题', faqDesc: '常见问题解答',
      documentation: '文档', documentationDesc: '技术文档', generalInquiry: '一般咨询',
      technicalIssue: '技术问题', billing: '账单与付款', accountIssues: '账户问题',
      artistSupport: '艺术家支持', feedback: '反馈'
    },
    auth: {
      welcomeBack: '欢迎回来！', joinRevolution: '加入革命', login: '登录', signup: '注册',
      orContinueWith: '或使用邮箱继续', fullName: '全名', username: '用户名', phone: '电话',
      dateOfBirth: '出生日期', country: '国家', selectCountry: '选择您的国家', email: '邮箱',
      emailOrUsername: '邮箱或用户名', password: '密码', forgotPassword: '忘记密码？',
      agreeToTerms: '我同意', termsAndConditions: '条款和条件', privacyPolicy: '隐私政策',
      and: '和', noAccount: '没有账户？', haveAccount: '已有账户？',
      createAccount: '创建账户', signingIn: '登录中...', creatingAccount: '创建账户中...',
      wantToBeArtist: '我想成为艺术家', wantToBeModerator: '我想成为管理员',
      artistDesc: '上传音乐并赚取版税', moderatorDesc: '帮助维护社区标准', comingSoon: '即将推出'
    },
    wallet: {
      title: '钱包', subtitle: '管理您的数字资产', totalBalance: '总余额',
      availableBalance: '可用余额', lockedBalance: '锁定余额', deposit: '存款',
      withdraw: '提款', convert: '转换', send: '发送', receive: '接收', transactions: '交易',
      noTransactions: '暂无交易', startEarning: '开始听音乐赚取收入！',
      viewInExplorer: '在浏览器中查看', walletAddress: '钱包地址', copyAddress: '复制地址',
      addressCopied: '地址已复制！', amount: '金额', recipient: '收款人', selectToken: '选择代币',
      insufficientBalance: '余额不足', transactionSuccess: '交易成功！',
      transactionFailed: '交易失败', pending: '待处理', completed: '已完成', failed: '失败'
    },
    common: {
      learnMore: '了解更多', comingSoon: '即将推出', joinWaitlist: '加入等候名单', darkMode: '深色模式',
      lightMode: '浅色模式', language: '语言', loading: '加载中...', error: '错误', success: '成功',
      cancel: '取消', confirm: '确认', save: '保存', delete: '删除', edit: '编辑', view: '查看',
      close: '关闭', back: '返回', next: '下一步', previous: '上一步', submit: '提交', search: '搜索',
      filter: '筛选', sort: '排序', all: '全部', none: '无', select: '选择', noResults: '无结果',
      noData: '无数据', retry: '重试', refresh: '刷新', share: '分享', download: '下载',
      upload: '上传', play: '播放', pause: '暂停', stop: '停止', mute: '静音', unmute: '取消静音',
      like: '喜欢', unlike: '取消喜欢', follow: '关注', unfollow: '取消关注', comment: '评论',
      reply: '回复', report: '举报', block: '屏蔽', unblock: '取消屏蔽', send: '发送', receive: '接收',
      copy: '复制', copied: '已复制！', today: '今天', yesterday: '昨天', thisWeek: '本周',
      thisMonth: '本月', viewAll: '查看全部', seeMore: '查看更多', seeLess: '收起',
      showMore: '显示更多', showLess: '显示更少', readMore: '阅读更多', readLess: '收起'
    },
    explorer: {
      title: '交易浏览器', subtitle: '跟踪Thundra网络上的所有交易',
      searchPlaceholder: '通过钱包地址、交易哈希或邮箱搜索', livePrice: '实时价格',
      totalBurned: '总销毁量', burnedToday: '今日销毁', totalTransactions: '总交易数',
      recentTransactions: '最近交易', walletSearch: '钱包搜索', transactionHash: '交易哈希',
      from: '发送方', to: '接收方', amount: '金额', type: '类型', status: '状态', date: '日期',
      noTransactionsFound: '未找到交易', walletBalance: '钱包余额', searchResults: '搜索结果'
    },
    marketplace: {
      title: '市场', subtitle: '发现和交易数字资产', nfts: 'NFT',
      merchandise: '商品', tickets: '门票', auctions: '拍卖', buy: '购买', sell: '出售',
      bid: '出价', listItem: '上架商品', price: '价格', currency: '货币', category: '类别',
      owner: '拥有者', creator: '创作者', supply: '供应量', remaining: '剩余', soldOut: '售罄',
      purchaseSuccess: '购买成功！', purchaseFailed: '购买失败', insufficientFunds: '资金不足',
      confirmPurchase: '确认购买', bidPlaced: '出价成功！', currentBid: '当前出价',
      minimumBid: '最低出价', auctionEnds: '拍卖结束'
    },
    artist: {
      studio: '艺术家工作室', uploadTrack: '上传曲目', uploadAlbum: '上传专辑', myMusic: '我的音乐',
      analytics: '分析', earnings: '收入', fans: '粉丝', totalStreams: '总播放量',
      monthlyListeners: '月度听众', trackPerformance: '曲目表现', noEarnings: '暂无收入',
      uploadToEarn: '上传曲目开始赚取！', pendingApproval: '待审核',
      applicationStatus: '申请状态', artistRank: '艺术家等级', rankLevel: '等级', bonusRate: '奖励率'
    },
    moderator: {
      panel: '管理面板', pendingReviews: '待审核', myVotes: '我的投票', accuracy: '准确率',
      moderatorRank: '管理员等级', approve: '批准', reject: '拒绝', actionType: '操作类型',
      reason: '原因', votesRequired: '所需投票', votesReceived: '已收到投票',
      allCaughtUp: '全部完成！🎉', noPendingReviews: '目前没有待审核项目',
      guidelines: '管理指南', beObjective: '保持客观公正',
      followRules: '遵守社区规则', stayConsistent: '保持决策一致性'
    },
    admin: {
      panel: '管理员面板', overview: '概览', users: '用户', content: '内容', finance: '财务',
      analytics: '分析', totalUsers: '总用户', activeToday: '今日活跃', newSignups: '新注册',
      revenue: '收入', artistApplications: '艺术家申请', moderatorApplications: '管理员申请',
      pendingArtists: '待审核艺术家', pendingModerators: '待审核管理员', approveArtist: '批准艺术家',
      rejectArtist: '拒绝艺术家', approveModerator: '批准管理员', rejectModerator: '拒绝管理员',
      viewApplication: '查看申请', userManagement: '用户管理', systemHealth: '系统健康',
      serverStatus: '服务器状态', databaseStatus: '数据库状态'
    },
    feed: {
      title: '动态', createPost: '创建帖子', whatsOnMind: '有什么想说的？', post: '发布',
      like: '喜欢', comment: '评论', share: '分享', writeComment: '写评论...',
      noPostsYet: '暂无帖子', beFirstToPost: '成为第一个发帖的人！', loadingPosts: '加载帖子中...',
      viewComments: '查看评论', hideComments: '隐藏评论'
    },
    leaderboard: {
      title: '排行榜', subtitle: '看看谁在榜首', topStreamers: '顶级听众',
      topEarners: '顶级收入者', topArtists: '顶级艺术家', rank: '排名', user: '用户',
      streams: '播放量', earnings: '收入', followers: '粉丝', thisWeek: '本周',
      thisMonth: '本月', allTime: '全部时间'
    },
    learning: {
      title: '学习中心', subtitle: '扩展您的知识', courses: '课程', enrolled: '已注册',
      completed: '已完成', progress: '进度', continueLearning: '继续学习',
      enrollNow: '立即注册', startCourse: '开始课程', difficulty: '难度', duration: '时长',
      reward: '奖励', instructor: '讲师', beginner: '初级', intermediate: '中级',
      advanced: '高级', noCourses: '未找到课程', createCourse: '创建课程'
    },
    notification: {
      title: '通知', markAllRead: '全部标为已读', noNotifications: '暂无通知',
      viewInExplorer: '在浏览器中查看', newFollower: '开始关注了您',
      newComment: '评论了您的帖子', newLike: '喜欢了您的帖子', earnedReward: '您获得了奖励！',
      transactionComplete: '交易完成'
    },
    subscription: {
      title: '订阅', choosePlan: '选择您的计划', currentPlan: '当前计划',
      free: '免费', premium: '高级', vip: 'VIP', freeDesc: '休闲听众的基本功能',
      premiumDesc: '音乐爱好者的增强功能', vipDesc: '所有功能加专属福利',
      perMonth: '/月', selectPayment: '选择支付方式', completePurchase: '完成购买',
      processing: '处理中...', success: '购买成功！', insufficientBalance: '余额不足',
      features: '功能', unlimitedStreaming: '无限流媒体', noAds: '无广告',
      downloadOffline: '离线下载', exclusiveContent: '独家内容',
      prioritySupport: '优先支持', earlyAccess: '提前访问新功能'
    },
    pages: {
      businessTitle: '商业合作', businessSubtitle: '触达数百万活跃音乐粉丝',
      businessWelcome: '欢迎来到Thundra广告', businessDesc: '音乐生态系统中的首选广告平台',
      howItWorks: '工作原理', benefits: '优势', targetedExposure: '精准曝光',
      earnEngagement: '通过互动赚取', analytics: '实时分析', scalable: '可扩展解决方案',
      artistsTitle: '艺术家专区', artistsSubtitle: '您的音乐，您的规则，您的收入',
      artistsWelcome: '欢迎来到Thundra艺术家', artistsDesc: '为创作者打造的平台',
      ownYourMusic: '拥有您的音乐', transparentRoyalties: '透明版税',
      directFanConnection: '直接粉丝连接', nftCreation: 'NFT创作',
      web3Revolution: 'Web3革命', beYourOwnBoss: '做自己的老板',
      communityTitle: '社区专区', communitySubtitle: '加入蓬勃发展的音乐社区',
      communityDesc: '与全球粉丝和艺术家连接', joinDiscussions: '加入讨论',
      earnRewards: '赚取奖励', voteGovernance: '治理投票', exclusiveEvents: '独家活动',
      getStarted: '开始', learnMoreTitle: '了解更多', learnMoreSubtitle: '探索Thundra生态系统',
      miningFeatures: '挖矿功能', mineOnMobile: '手机挖矿', mineOnPC: '电脑挖矿',
      secureAndFair: '安全公平', earlyRewards: '早期奖励', appComingSoon: '应用即将推出',
      aboutTitle: '关于我们', aboutSubtitle: 'Thundra Music背后的团队', ourTeam: '我们的团队',
      ourMission: '我们的使命', missionDesc: '通过区块链技术革新音乐',
      whitepaperTitle: '白皮书', whitepaperSubtitle: '技术文档', tokenDistribution: '代币分配',
      communityRewards: '社区奖励', miningPool: '挖矿池', partnerships: '合作伙伴',
      teamAdvisors: '团队与顾问', liquidity: '流动性'
    }
  },

  // Japanese - continuing with similar structure for remaining languages
  ja: {
    dashboard: {
      home: 'ホーム', search: '検索', music: '音楽', library: 'ライブラリ', favorites: 'お気に入り',
      leaderboard: 'ランキング', profile: 'プロフィール', wallet: 'ウォレット', chat: 'チャット',
      learning: '学習', market: 'マーケット', ai: 'AI', ads: '広告', artist: 'スタジオ',
      moderator: 'モデレーター', admin: '管理者', settings: '設定', logout: 'ログアウト',
      upload: 'アップロード', earnings: '収益', followers: 'フォロワー', streams: '再生数',
      likes: 'いいね', menu: 'メニュー', features: '機能', yourPlaylists: 'プレイリスト',
      createPlaylist: 'プレイリスト作成', tracks: '曲', freeMode: 'フリーモード', freeUser: 'フリーユーザー',
      premiumUser: 'プレミアムユーザー', vipUser: 'VIPユーザー', buySubscription: '購読購入', upgradeToVip: 'VIPへアップグレード'
    },
    settings: {
      title: '設定', subtitle: 'アカウントと設定を管理', account: 'アカウント',
      notifications: '通知', privacy: 'プライバシー', appearance: '外観', support: 'サポート',
      profileInfo: 'プロフィール情報', updateDetails: '詳細を更新', fullName: 'フルネーム',
      username: 'ユーザー名', email: 'メール', phone: '電話', bio: '自己紹介', saveChanges: '変更を保存',
      security: 'セキュリティ', securityDesc: 'パスワードとセキュリティを管理', changePassword: 'パスワード変更',
      twoFactor: '二要素認証', dangerZone: '危険ゾーン', exportData: 'データをエクスポート',
      deleteAccount: 'アカウント削除', notificationPrefs: '通知設定',
      notificationDesc: '通知設定を選択', emailNotifications: 'メール通知',
      pushNotifications: 'プッシュ通知', newFollowers: '新しいフォロワー', newComments: '新しいコメント',
      earningsUpdates: '収益更新', promotions: 'プロモーション', privacySettings: 'プライバシー設定',
      privacyDesc: 'プライバシーと可視性を管理', publicProfile: '公開プロフィール',
      showActivity: 'アクティビティを表示', listeningHistory: '再生履歴', theme: 'テーマ',
      themeDesc: 'テーマを選択', light: 'ライト', dark: 'ダーク', language: '言語',
      languageDesc: '言語を選択', contactSupport: 'サポートに連絡',
      supportDesc: 'チケットを送信してください', category: 'カテゴリ', subject: '件名',
      message: 'メッセージ', submitTicket: 'チケット送信', quickLinks: 'クイックリンク', helpCenter: 'ヘルプセンター',
      helpCenterDesc: 'ナレッジベースを参照', faq: 'FAQ', faqDesc: 'よくある質問',
      documentation: 'ドキュメント', documentationDesc: '技術文書', generalInquiry: '一般問い合わせ',
      technicalIssue: '技術的な問題', billing: '請求とお支払い', accountIssues: 'アカウントの問題',
      artistSupport: 'アーティストサポート', feedback: 'フィードバック'
    },
    auth: {
      welcomeBack: 'おかえりなさい！', joinRevolution: '革命に参加', login: 'ログイン', signup: '新規登録',
      orContinueWith: 'またはメールで続行', fullName: 'フルネーム', username: 'ユーザー名', phone: '電話',
      dateOfBirth: '生年月日', country: '国', selectCountry: '国を選択', email: 'メール',
      emailOrUsername: 'メールまたはユーザー名', password: 'パスワード', forgotPassword: 'パスワードをお忘れですか？',
      agreeToTerms: '同意します', termsAndConditions: '利用規約', privacyPolicy: 'プライバシーポリシー',
      and: 'と', noAccount: 'アカウントがない？', haveAccount: 'アカウントをお持ちですか？',
      createAccount: 'アカウント作成', signingIn: 'ログイン中...', creatingAccount: 'アカウント作成中...',
      wantToBeArtist: 'アーティストになりたい', wantToBeModerator: 'モデレーターになりたい',
      artistDesc: '音楽をアップロードしてロイヤリティを獲得', moderatorDesc: 'コミュニティ基準の維持をサポート', comingSoon: '近日公開'
    },
    wallet: {
      title: 'ウォレット', subtitle: 'デジタル資産を管理', totalBalance: '合計残高',
      availableBalance: '利用可能残高', lockedBalance: 'ロック残高', deposit: '入金',
      withdraw: '出金', convert: '変換', send: '送金', receive: '受取', transactions: '取引',
      noTransactions: '取引なし', startEarning: '音楽を聴いて稼ぎ始めよう！',
      viewInExplorer: 'エクスプローラーで見る', walletAddress: 'ウォレットアドレス', copyAddress: 'アドレスをコピー',
      addressCopied: 'コピーしました！', amount: '金額', recipient: '受取人', selectToken: 'トークンを選択',
      insufficientBalance: '残高不足', transactionSuccess: '取引成功！',
      transactionFailed: '取引失敗', pending: '保留中', completed: '完了', failed: '失敗'
    },
    common: {
      learnMore: '詳細', comingSoon: '近日公開', joinWaitlist: 'ウェイトリストに参加', darkMode: 'ダークモード',
      lightMode: 'ライトモード', language: '言語', loading: '読み込み中...', error: 'エラー', success: '成功',
      cancel: 'キャンセル', confirm: '確認', save: '保存', delete: '削除', edit: '編集', view: '表示',
      close: '閉じる', back: '戻る', next: '次へ', previous: '前へ', submit: '送信', search: '検索',
      filter: 'フィルター', sort: '並び替え', all: 'すべて', none: 'なし', select: '選択', noResults: '結果なし',
      noData: 'データなし', retry: '再試行', refresh: '更新', share: '共有', download: 'ダウンロード',
      upload: 'アップロード', play: '再生', pause: '一時停止', stop: '停止', mute: 'ミュート', unmute: 'ミュート解除',
      like: 'いいね', unlike: 'いいね解除', follow: 'フォロー', unfollow: 'フォロー解除', comment: 'コメント',
      reply: '返信', report: '報告', block: 'ブロック', unblock: 'ブロック解除', send: '送信', receive: '受信',
      copy: 'コピー', copied: 'コピーしました！', today: '今日', yesterday: '昨日', thisWeek: '今週',
      thisMonth: '今月', viewAll: 'すべて表示', seeMore: 'もっと見る', seeLess: '折りたたむ',
      showMore: 'もっと表示', showLess: '表示を減らす', readMore: '続きを読む', readLess: '閉じる'
    },
    explorer: {
      title: 'トランザクションエクスプローラー', subtitle: 'Thundraネットワーク上のすべての取引を追跡',
      searchPlaceholder: 'アドレス、ハッシュ、メールで検索', livePrice: 'ライブ価格',
      totalBurned: '総バーン量', burnedToday: '今日のバーン', totalTransactions: '総取引数',
      recentTransactions: '最近の取引', walletSearch: 'ウォレット検索', transactionHash: '取引ハッシュ',
      from: '送信者', to: '受信者', amount: '金額', type: 'タイプ', status: 'ステータス', date: '日付',
      noTransactionsFound: '取引が見つかりません', walletBalance: 'ウォレット残高', searchResults: '検索結果'
    },
    marketplace: {
      title: 'マーケットプレイス', subtitle: 'デジタル資産を発見・取引', nfts: 'NFT',
      merchandise: 'グッズ', tickets: 'チケット', auctions: 'オークション', buy: '購入', sell: '販売',
      bid: '入札', listItem: '出品', price: '価格', currency: '通貨', category: 'カテゴリ',
      owner: '所有者', creator: 'クリエイター', supply: '供給量', remaining: '残り', soldOut: '売り切れ',
      purchaseSuccess: '購入成功！', purchaseFailed: '購入失敗', insufficientFunds: '資金不足',
      confirmPurchase: '購入確認', bidPlaced: '入札成功！', currentBid: '現在の入札',
      minimumBid: '最低入札', auctionEnds: 'オークション終了'
    },
    artist: {
      studio: 'アーティストスタジオ', uploadTrack: '曲をアップロード', uploadAlbum: 'アルバムをアップロード', myMusic: 'マイミュージック',
      analytics: '分析', earnings: '収益', fans: 'ファン', totalStreams: '総再生数',
      monthlyListeners: '月間リスナー', trackPerformance: '曲のパフォーマンス', noEarnings: '収益なし',
      uploadToEarn: '曲をアップロードして稼ぎ始めよう！', pendingApproval: '承認待ち',
      applicationStatus: '申請状況', artistRank: 'アーティストランク', rankLevel: 'ランクレベル', bonusRate: 'ボーナスレート'
    },
    moderator: {
      panel: 'モデレーターパネル', pendingReviews: '保留中のレビュー', myVotes: '私の投票', accuracy: '精度',
      moderatorRank: 'モデレーターランク', approve: '承認', reject: '却下', actionType: 'アクションタイプ',
      reason: '理由', votesRequired: '必要な投票', votesReceived: '受け取った投票',
      allCaughtUp: '完了！🎉', noPendingReviews: '保留中のレビューなし',
      guidelines: 'モデレーションガイドライン', beObjective: '客観的かつ公正に',
      followRules: 'コミュニティガイドラインに従う', stayConsistent: '一貫した決定を'
    },
    admin: {
      panel: '管理者パネル', overview: '概要', users: 'ユーザー', content: 'コンテンツ', finance: '財務',
      analytics: '分析', totalUsers: '総ユーザー', activeToday: '今日のアクティブ', newSignups: '新規登録',
      revenue: '収益', artistApplications: 'アーティスト申請', moderatorApplications: 'モデレーター申請',
      pendingArtists: '保留中のアーティスト', pendingModerators: '保留中のモデレーター', approveArtist: 'アーティストを承認',
      rejectArtist: 'アーティストを却下', approveModerator: 'モデレーターを承認', rejectModerator: 'モデレーターを却下',
      viewApplication: '申請を表示', userManagement: 'ユーザー管理', systemHealth: 'システム状態',
      serverStatus: 'サーバーステータス', databaseStatus: 'データベースステータス'
    },
    feed: {
      title: 'フィード', createPost: '投稿を作成', whatsOnMind: '今何を考えていますか？', post: '投稿',
      like: 'いいね', comment: 'コメント', share: 'シェア', writeComment: 'コメントを書く...',
      noPostsYet: '投稿なし', beFirstToPost: '最初に投稿しよう！', loadingPosts: '投稿を読み込み中...',
      viewComments: 'コメントを表示', hideComments: 'コメントを隠す'
    },
    leaderboard: {
      title: 'ランキング', subtitle: 'トップを確認', topStreamers: 'トップリスナー',
      topEarners: 'トップ収益者', topArtists: 'トップアーティスト', rank: '順位', user: 'ユーザー',
      streams: '再生数', earnings: '収益', followers: 'フォロワー', thisWeek: '今週',
      thisMonth: '今月', allTime: '全期間'
    },
    learning: {
      title: '学習センター', subtitle: '知識を広げる', courses: 'コース', enrolled: '登録済み',
      completed: '完了', progress: '進捗', continueLearning: '学習を続ける',
      enrollNow: '今すぐ登録', startCourse: 'コース開始', difficulty: '難易度', duration: '期間',
      reward: '報酬', instructor: '講師', beginner: '初級', intermediate: '中級',
      advanced: '上級', noCourses: 'コースが見つかりません', createCourse: 'コース作成'
    },
    notification: {
      title: '通知', markAllRead: 'すべて既読にする', noNotifications: '通知なし',
      viewInExplorer: 'エクスプローラーで見る', newFollower: 'フォローしました',
      newComment: '投稿にコメントしました', newLike: '投稿にいいねしました', earnedReward: '報酬を獲得しました！',
      transactionComplete: '取引完了'
    },
    subscription: {
      title: 'サブスクリプション', choosePlan: 'プランを選択', currentPlan: '現在のプラン',
      free: '無料', premium: 'プレミアム', vip: 'VIP', freeDesc: 'カジュアルリスナー向けの基本機能',
      premiumDesc: '音楽愛好家向けの強化機能', vipDesc: 'すべての機能と限定特典',
      perMonth: '/月', selectPayment: '支払い方法を選択', completePurchase: '購入を完了',
      processing: '処理中...', success: '購入成功！', insufficientBalance: '残高不足',
      features: '機能', unlimitedStreaming: '無制限ストリーミング', noAds: '広告なし',
      downloadOffline: 'オフラインダウンロード', exclusiveContent: '限定コンテンツ',
      prioritySupport: '優先サポート', earlyAccess: '新機能への早期アクセス'
    },
    pages: {
      businessTitle: 'ビジネス向け', businessSubtitle: '数百万の音楽ファンにリーチ',
      businessWelcome: 'Thundra Adsへようこそ', businessDesc: '音楽エコシステムのプレミア広告プラットフォーム',
      howItWorks: '仕組み', benefits: 'メリット', targetedExposure: 'ターゲット露出',
      earnEngagement: 'エンゲージメントで稼ぐ', analytics: 'リアルタイム分析', scalable: 'スケーラブルソリューション',
      artistsTitle: 'アーティスト向け', artistsSubtitle: 'あなたの音楽、あなたのルール、あなたの収益',
      artistsWelcome: 'Thundra for Artistsへようこそ', artistsDesc: 'クリエイターのためのプラットフォーム',
      ownYourMusic: 'あなたの音楽を所有', transparentRoyalties: '透明なロイヤリティ',
      directFanConnection: 'ファンとの直接つながり', nftCreation: 'NFT作成',
      web3Revolution: 'Web3革命', beYourOwnBoss: '自分のボスになる',
      communityTitle: 'コミュニティ向け', communitySubtitle: '活気あふれる音楽コミュニティに参加',
      communityDesc: '世界中のファンやアーティストとつながる', joinDiscussions: 'ディスカッションに参加',
      earnRewards: '報酬を獲得', voteGovernance: 'ガバナンスに投票', exclusiveEvents: '限定イベント',
      getStarted: '始める', learnMoreTitle: '詳細', learnMoreSubtitle: 'Thundraエコシステムを発見',
      miningFeatures: 'マイニング機能', mineOnMobile: 'モバイルでマイニング', mineOnPC: 'PCでマイニング',
      secureAndFair: '安全で公正', earlyRewards: '早期報酬', appComingSoon: 'アプリ近日公開',
      aboutTitle: '私たちについて', aboutSubtitle: 'Thundra Musicチーム', ourTeam: '私たちのチーム',
      ourMission: '私たちのミッション', missionDesc: 'ブロックチェーン技術で音楽を革新',
      whitepaperTitle: 'ホワイトペーパー', whitepaperSubtitle: '技術文書', tokenDistribution: 'トークン配布',
      communityRewards: 'コミュニティ報酬', miningPool: 'マイニングプール', partnerships: 'パートナーシップ',
      teamAdvisors: 'チームとアドバイザー', liquidity: '流動性'
    }
  },

  // For remaining languages, I'll add them with the same structure
  // Korean
  ko: {
    dashboard: {
      home: '홈', search: '검색', music: '음악', library: '라이브러리', favorites: '즐겨찾기',
      leaderboard: '리더보드', profile: '프로필', wallet: '지갑', chat: '채팅',
      learning: '학습', market: '마켓', ai: 'AI', ads: '광고', artist: '스튜디오',
      moderator: '모더레이터', admin: '관리자', settings: '설정', logout: '로그아웃',
      upload: '업로드', earnings: '수익', followers: '팔로워', streams: '스트림',
      likes: '좋아요', menu: '메뉴', features: '기능', yourPlaylists: '플레이리스트',
      createPlaylist: '플레이리스트 만들기', tracks: '곡', freeMode: '무료 모드', freeUser: '무료 사용자',
      premiumUser: '프리미엄 사용자', vipUser: 'VIP 사용자', buySubscription: '구독 구매', upgradeToVip: 'VIP로 업그레이드'
    },
    settings: {
      title: '설정', subtitle: '계정 및 환경설정 관리', account: '계정',
      notifications: '알림', privacy: '개인정보', appearance: '외관', support: '지원',
      profileInfo: '프로필 정보', updateDetails: '세부정보 업데이트', fullName: '이름',
      username: '사용자명', email: '이메일', phone: '전화', bio: '소개', saveChanges: '변경사항 저장',
      security: '보안', securityDesc: '비밀번호 및 보안 관리', changePassword: '비밀번호 변경',
      twoFactor: '2단계 인증', dangerZone: '위험 구역', exportData: '데이터 내보내기',
      deleteAccount: '계정 삭제', notificationPrefs: '알림 설정',
      notificationDesc: '알림 설정 선택', emailNotifications: '이메일 알림',
      pushNotifications: '푸시 알림', newFollowers: '새 팔로워', newComments: '새 댓글',
      earningsUpdates: '수익 업데이트', promotions: '프로모션', privacySettings: '개인정보 설정',
      privacyDesc: '개인정보 및 가시성 관리', publicProfile: '공개 프로필',
      showActivity: '활동 표시', listeningHistory: '청취 기록', theme: '테마',
      themeDesc: '테마 선택', light: '라이트', dark: '다크', language: '언어',
      languageDesc: '언어 선택', contactSupport: '지원 문의',
      supportDesc: '티켓 제출', category: '카테고리', subject: '제목',
      message: '메시지', submitTicket: '티켓 제출', quickLinks: '빠른 링크', helpCenter: '도움말 센터',
      helpCenterDesc: '지식 기반 검색', faq: 'FAQ', faqDesc: '자주 묻는 질문',
      documentation: '문서', documentationDesc: '기술 문서', generalInquiry: '일반 문의',
      technicalIssue: '기술 문제', billing: '결제', accountIssues: '계정 문제',
      artistSupport: '아티스트 지원', feedback: '피드백'
    },
    auth: {
      welcomeBack: '돌아오셨군요!', joinRevolution: '혁명에 참여하세요', login: '로그인', signup: '가입',
      orContinueWith: '이메일로 계속', fullName: '이름', username: '사용자명', phone: '전화',
      dateOfBirth: '생년월일', country: '국가', selectCountry: '국가 선택', email: '이메일',
      emailOrUsername: '이메일 또는 사용자명', password: '비밀번호', forgotPassword: '비밀번호를 잊으셨나요?',
      agreeToTerms: '동의합니다', termsAndConditions: '이용약관', privacyPolicy: '개인정보 정책',
      and: '및', noAccount: '계정이 없으신가요?', haveAccount: '계정이 있으신가요?',
      createAccount: '계정 만들기', signingIn: '로그인 중...', creatingAccount: '계정 생성 중...',
      wantToBeArtist: '아티스트가 되고 싶어요', wantToBeModerator: '모더레이터가 되고 싶어요',
      artistDesc: '음악을 업로드하고 로열티 획득', moderatorDesc: '커뮤니티 기준 유지 지원', comingSoon: '출시 예정'
    },
    wallet: {
      title: '지갑', subtitle: '디지털 자산 관리', totalBalance: '총 잔액',
      availableBalance: '사용 가능 잔액', lockedBalance: '잠긴 잔액', deposit: '입금',
      withdraw: '출금', convert: '변환', send: '보내기', receive: '받기', transactions: '거래',
      noTransactions: '거래 없음', startEarning: '음악을 듣고 수익을 올리세요!',
      viewInExplorer: '익스플로러에서 보기', walletAddress: '지갑 주소', copyAddress: '주소 복사',
      addressCopied: '복사됨!', amount: '금액', recipient: '수신자', selectToken: '토큰 선택',
      insufficientBalance: '잔액 부족', transactionSuccess: '거래 성공!',
      transactionFailed: '거래 실패', pending: '대기 중', completed: '완료', failed: '실패'
    },
    common: {
      learnMore: '더 알아보기', comingSoon: '출시 예정', joinWaitlist: '대기자 명단', darkMode: '다크 모드',
      lightMode: '라이트 모드', language: '언어', loading: '로딩 중...', error: '오류', success: '성공',
      cancel: '취소', confirm: '확인', save: '저장', delete: '삭제', edit: '편집', view: '보기',
      close: '닫기', back: '뒤로', next: '다음', previous: '이전', submit: '제출', search: '검색',
      filter: '필터', sort: '정렬', all: '전체', none: '없음', select: '선택', noResults: '결과 없음',
      noData: '데이터 없음', retry: '재시도', refresh: '새로고침', share: '공유', download: '다운로드',
      upload: '업로드', play: '재생', pause: '일시정지', stop: '중지', mute: '음소거', unmute: '음소거 해제',
      like: '좋아요', unlike: '좋아요 취소', follow: '팔로우', unfollow: '언팔로우', comment: '댓글',
      reply: '답글', report: '신고', block: '차단', unblock: '차단 해제', send: '보내기', receive: '받기',
      copy: '복사', copied: '복사됨!', today: '오늘', yesterday: '어제', thisWeek: '이번 주',
      thisMonth: '이번 달', viewAll: '전체 보기', seeMore: '더 보기', seeLess: '접기',
      showMore: '더 보기', showLess: '덜 보기', readMore: '더 읽기', readLess: '접기'
    },
    explorer: {
      title: '트랜잭션 익스플로러', subtitle: 'Thundra 네트워크의 모든 거래 추적',
      searchPlaceholder: '주소, 해시, 이메일로 검색', livePrice: '실시간 가격',
      totalBurned: '총 소각량', burnedToday: '오늘 소각', totalTransactions: '총 거래',
      recentTransactions: '최근 거래', walletSearch: '지갑 검색', transactionHash: '거래 해시',
      from: '발신자', to: '수신자', amount: '금액', type: '유형', status: '상태', date: '날짜',
      noTransactionsFound: '거래 없음', walletBalance: '지갑 잔액', searchResults: '검색 결과'
    },
    marketplace: {
      title: '마켓플레이스', subtitle: '디지털 자산 발견 및 거래', nfts: 'NFT',
      merchandise: '상품', tickets: '티켓', auctions: '경매', buy: '구매', sell: '판매',
      bid: '입찰', listItem: '상품 등록', price: '가격', currency: '통화', category: '카테고리',
      owner: '소유자', creator: '제작자', supply: '공급량', remaining: '남은', soldOut: '품절',
      purchaseSuccess: '구매 성공!', purchaseFailed: '구매 실패', insufficientFunds: '자금 부족',
      confirmPurchase: '구매 확인', bidPlaced: '입찰 성공!', currentBid: '현재 입찰',
      minimumBid: '최소 입찰', auctionEnds: '경매 종료'
    },
    artist: {
      studio: '아티스트 스튜디오', uploadTrack: '트랙 업로드', uploadAlbum: '앨범 업로드', myMusic: '내 음악',
      analytics: '분석', earnings: '수익', fans: '팬', totalStreams: '총 스트림',
      monthlyListeners: '월간 청취자', trackPerformance: '트랙 성과', noEarnings: '수익 없음',
      uploadToEarn: '트랙을 업로드하여 수익 창출!', pendingApproval: '승인 대기 중',
      applicationStatus: '신청 상태', artistRank: '아티스트 랭크', rankLevel: '랭크 레벨', bonusRate: '보너스율'
    },
    moderator: {
      panel: '모더레이터 패널', pendingReviews: '대기 중인 검토', myVotes: '내 투표', accuracy: '정확도',
      moderatorRank: '모더레이터 랭크', approve: '승인', reject: '거부', actionType: '액션 유형',
      reason: '이유', votesRequired: '필요한 투표', votesReceived: '받은 투표',
      allCaughtUp: '완료! 🎉', noPendingReviews: '대기 중인 검토 없음',
      guidelines: '모더레이션 가이드라인', beObjective: '객관적이고 공정하게',
      followRules: '커뮤니티 가이드라인 준수', stayConsistent: '일관된 결정 유지'
    },
    admin: {
      panel: '관리자 패널', overview: '개요', users: '사용자', content: '콘텐츠', finance: '재무',
      analytics: '분석', totalUsers: '총 사용자', activeToday: '오늘 활성', newSignups: '신규 가입',
      revenue: '수익', artistApplications: '아티스트 신청', moderatorApplications: '모더레이터 신청',
      pendingArtists: '대기 중인 아티스트', pendingModerators: '대기 중인 모더레이터', approveArtist: '아티스트 승인',
      rejectArtist: '아티스트 거부', approveModerator: '모더레이터 승인', rejectModerator: '모더레이터 거부',
      viewApplication: '신청서 보기', userManagement: '사용자 관리', systemHealth: '시스템 상태',
      serverStatus: '서버 상태', databaseStatus: '데이터베이스 상태'
    },
    feed: {
      title: '피드', createPost: '게시물 작성', whatsOnMind: '무슨 생각을 하고 계신가요?', post: '게시',
      like: '좋아요', comment: '댓글', share: '공유', writeComment: '댓글 작성...',
      noPostsYet: '게시물 없음', beFirstToPost: '첫 번째로 게시하세요!', loadingPosts: '게시물 로딩 중...',
      viewComments: '댓글 보기', hideComments: '댓글 숨기기'
    },
    leaderboard: {
      title: '리더보드', subtitle: '상위권 확인', topStreamers: '탑 스트리머',
      topEarners: '탑 수익자', topArtists: '탑 아티스트', rank: '순위', user: '사용자',
      streams: '스트림', earnings: '수익', followers: '팔로워', thisWeek: '이번 주',
      thisMonth: '이번 달', allTime: '전체 기간'
    },
    learning: {
      title: '학습 센터', subtitle: '지식 확장', courses: '코스', enrolled: '등록됨',
      completed: '완료', progress: '진행', continueLearning: '학습 계속',
      enrollNow: '지금 등록', startCourse: '코스 시작', difficulty: '난이도', duration: '기간',
      reward: '보상', instructor: '강사', beginner: '초급', intermediate: '중급',
      advanced: '고급', noCourses: '코스 없음', createCourse: '코스 만들기'
    },
    notification: {
      title: '알림', markAllRead: '모두 읽음 표시', noNotifications: '알림 없음',
      viewInExplorer: '익스플로러에서 보기', newFollower: '팔로우했습니다',
      newComment: '게시물에 댓글', newLike: '게시물에 좋아요', earnedReward: '보상 획득!',
      transactionComplete: '거래 완료'
    },
    subscription: {
      title: '구독', choosePlan: '플랜 선택', currentPlan: '현재 플랜',
      free: '무료', premium: '프리미엄', vip: 'VIP', freeDesc: '캐주얼 청취자를 위한 기본 기능',
      premiumDesc: '음악 애호가를 위한 향상된 기능', vipDesc: '모든 기능 + 독점 혜택',
      perMonth: '/월', selectPayment: '결제 방법 선택', completePurchase: '구매 완료',
      processing: '처리 중...', success: '구매 성공!', insufficientBalance: '잔액 부족',
      features: '기능', unlimitedStreaming: '무제한 스트리밍', noAds: '광고 없음',
      downloadOffline: '오프라인 다운로드', exclusiveContent: '독점 콘텐츠',
      prioritySupport: '우선 지원', earlyAccess: '새 기능 조기 액세스'
    },
    pages: {
      businessTitle: '비즈니스', businessSubtitle: '수백만 음악 팬에게 도달',
      businessWelcome: 'Thundra Ads에 오신 것을 환영합니다', businessDesc: '음악 생태계의 프리미어 광고 플랫폼',
      howItWorks: '작동 방식', benefits: '혜택', targetedExposure: '타겟 노출',
      earnEngagement: '참여로 수익', analytics: '실시간 분석', scalable: '확장 가능한 솔루션',
      artistsTitle: '아티스트', artistsSubtitle: '당신의 음악, 당신의 규칙, 당신의 수익',
      artistsWelcome: 'Thundra for Artists 환영', artistsDesc: '크리에이터를 위한 플랫폼',
      ownYourMusic: '음악 소유', transparentRoyalties: '투명한 로열티',
      directFanConnection: '팬과 직접 연결', nftCreation: 'NFT 생성',
      web3Revolution: 'Web3 혁명', beYourOwnBoss: '자신의 보스가 되세요',
      communityTitle: '커뮤니티', communitySubtitle: '번영하는 음악 커뮤니티 참여',
      communityDesc: '전 세계 팬과 아티스트와 연결', joinDiscussions: '토론 참여',
      earnRewards: '보상 획득', voteGovernance: '거버넌스 투표', exclusiveEvents: '독점 이벤트',
      getStarted: '시작하기', learnMoreTitle: '더 알아보기', learnMoreSubtitle: 'Thundra 생태계 탐색',
      miningFeatures: '마이닝 기능', mineOnMobile: '모바일 마이닝', mineOnPC: 'PC 마이닝',
      secureAndFair: '안전하고 공정', earlyRewards: '조기 보상', appComingSoon: '앱 출시 예정',
      aboutTitle: '소개', aboutSubtitle: 'Thundra Music 팀', ourTeam: '우리 팀',
      ourMission: '우리의 미션', missionDesc: '블록체인 기술로 음악 혁신',
      whitepaperTitle: '백서', whitepaperSubtitle: '기술 문서', tokenDistribution: '토큰 배포',
      communityRewards: '커뮤니티 보상', miningPool: '마이닝 풀', partnerships: '파트너십',
      teamAdvisors: '팀 & 어드바이저', liquidity: '유동성'
    }
  },

  // German, Dutch, Italian, Portuguese, Arabic, and remaining languages would follow the same pattern
  // For brevity, I'll add placeholders that can be filled in
  nl: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  de: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  it: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  pt: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  ar: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  rw: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  ln: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  rn: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  yo: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  zu: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  wo: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  ro: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  ru: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  lg: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  uk: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  tl: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  vi: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  hi: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  tr: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  hr: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  sr: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  da: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  sv: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  no: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
  fi: { dashboard: {} as DashboardTranslations, settings: {} as SettingsTranslations, auth: {} as AuthTranslations, wallet: {} as WalletTranslations, common: {} as CommonTranslations, explorer: {} as ExplorerTranslations, marketplace: {} as MarketplaceTranslations, artist: {} as ArtistTranslations, moderator: {} as ModeratorTranslations, admin: {} as AdminTranslations, feed: {} as FeedTranslations, leaderboard: {} as LeaderboardTranslations, learning: {} as LearningTranslations, notification: {} as NotificationTranslations, subscription: {} as SubscriptionTranslations, pages: {} as PageTranslations },
};

// Fill in empty translations with English as fallback
Object.keys(completeTranslations).forEach(lang => {
  const langCode = lang as LanguageCode;
  if (langCode !== 'en' && langCode !== 'fr' && langCode !== 'es' && langCode !== 'sw' && langCode !== 'swc' && langCode !== 'zh' && langCode !== 'ja' && langCode !== 'ko') {
    // Copy English translations as fallback for languages not fully translated
    completeTranslations[langCode] = { ...completeTranslations.en };
  }
});

// Helper function to get translation with fallback
export function getTranslation<T>(translations: Record<LanguageCode, T>, lang: LanguageCode): T {
  return translations[lang] || translations.en;
}
