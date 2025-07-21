import {
	ShoppingBagOutlined,
	LogoutOutlined,
	StoreOutlined,
	SellOutlined,
	SyncAltOutlined,
	TimelineOutlined,
	LocalShippingOutlined,
	AccountBalanceWalletOutlined,
	PeopleAltOutlined,
	PersonOutline,
	Dashboard as DashboardIcon,
	CategoryOutlined,
} from '@mui/icons-material';

export const navigationItems = [
	{ name: 'Tableau de bord', icon: <DashboardIcon />, path: '/' },
	{ name: 'Clients', icon: <PersonOutline />, path: '/clients' },
	{ name: 'Fournisseurs', icon: <StoreOutlined />, path: '/suppliers' },
	{ name: 'Catégories', icon: <CategoryOutlined />, path: '/categories' },
	{ name: 'Articles', icon: <SellOutlined />, path: '/articles' },
	{ name: 'Ventes', icon: <ShoppingBagOutlined />, path: '/sales' },
	{ name: 'Achats', icon: <LocalShippingOutlined />, path: '/purchases' },
	{ name: 'Transactions', icon: <SyncAltOutlined />, path: '/transactions' },
	{
		name: 'Comptes',
		icon: <AccountBalanceWalletOutlined />,
		path: '/accounts',
	},
	{ name: 'Rapports', icon: <TimelineOutlined />, path: '/reports' },
	null,
	{ name: 'Utilisateurs', icon: <PeopleAltOutlined />, path: '/users' },
	{ name: 'Déconnexion', icon: <LogoutOutlined />, path: '/logout' },
];
