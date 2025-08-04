import {
	ShoppingBagOutlined,
	LogoutOutlined,
	StoreOutlined,
	SyncAltOutlined,
	TimelineOutlined,
	LocalShippingOutlined,
	PeopleAltOutlined,
	PersonOutline,
	DashboardOutlined,
} from '@mui/icons-material';

export const navigationItems = [
	{ name: 'Tableau de bord', icon: <DashboardOutlined />, path: '/' },
	{ name: 'Contacts', icon: <PersonOutline />, path: '/contacts' },
	{ name: 'Ventes', icon: <ShoppingBagOutlined />, path: '/sales' },
	{ name: 'Achats', icon: <LocalShippingOutlined />, path: '/purchases' },
	{ name: 'Opérations', icon: <SyncAltOutlined />, path: '/transactions' },
	{ name: 'Rapports', icon: <TimelineOutlined />, path: '/reports' },
	null,
	{ name: 'Utilisateurs', icon: <PeopleAltOutlined />, path: '/users' },
	{ name: 'Déconnexion', icon: <LogoutOutlined />, path: '/logout' },
];
