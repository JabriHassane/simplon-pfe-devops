import { createContext, useContext, useState, ReactNode } from 'react';

interface DrawerContextType {
	mobileOpen: boolean;
	setMobileOpen: (open: boolean) => void;
	toggleDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: ReactNode }) {
	const [mobileOpen, setMobileOpen] = useState(false);

	const toggleDrawer = () => {
		setMobileOpen(!mobileOpen);
	};

	return (
		<DrawerContext.Provider value={{ mobileOpen, setMobileOpen, toggleDrawer }}>
			{children}
		</DrawerContext.Provider>
	);
}

export function useDrawer() {
	const context = useContext(DrawerContext);
	if (context === undefined) {
		throw new Error('useDrawer must be used within a DrawerProvider');
	}
	return context;
}
