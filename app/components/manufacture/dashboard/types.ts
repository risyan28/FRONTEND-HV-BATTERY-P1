// Sidebar Component
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Header Component
export interface HeaderProps {
  onMenuClick: () => void;
}

export interface BottomNavProps {
  onMenuClick: () => void;
}
