import React, { ReactNode } from 'react';
import '@/assets/css/sidebar.css';

type ParentProps = {
    children: ReactNode;
};

export default ({ children }: Omit<ParentProps, 'render'>) => {
    const closeSidebar = () => {
        // On mobile the sidebar is an overlay toggled open via the 'active-nav'
        // class (see NavigationBar's hamburger button). Nothing previously closed
        // it again, so it stayed open over the page after selecting a link.
        document.getElementById('sidebar')?.classList.remove('active-nav');
    };

    return (
        <>
            <div className='sidebar' id='sidebar' onClick={closeSidebar}>
                {children}
            </div>
        </>
    );
};
