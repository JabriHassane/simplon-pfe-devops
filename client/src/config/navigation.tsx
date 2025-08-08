import {
	ShoppingBagOutlined,
	LogoutOutlined,
	SyncAltOutlined, LocalShippingOutlined,
	PeopleAltOutlined,
	PersonOutline,
	DashboardOutlined, StoreOutlined
} from '@mui/icons-material';

export const navigationItems = [
	{ name: 'Tableau de bord', icon: <DashboardOutlined />, path: '/' },
	{ name: 'Clients', icon: <PersonOutline />, path: '/clients' },
	{ name: 'Fournisseurs', icon: <StoreOutlined />, path: '/suppliers' },
	{ name: 'Ventes', icon: <ShoppingBagOutlined />, path: '/sales' },
	{ name: 'Achats', icon: <LocalShippingOutlined />, path: '/purchases' },
	{ name: 'Opérations', icon: <SyncAltOutlined />, path: '/transactions' },
	null,
	{ name: 'Utilisateurs', icon: <PeopleAltOutlined />, path: '/users' },
	{ name: 'Déconnexion', icon: <LogoutOutlined />, path: '/logout' },
];
