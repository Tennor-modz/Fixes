import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCogs, faCoins, faGift, faLayerGroup, faServer, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center h-full no-underline text-neutral-300 px-6 cursor-pointer transition-all duration-150`};

        &:active,
        &:hover {
            ${tw`text-neutral-100 bg-black`};
        }

        &:active,
        &:hover,
        &.active {
            box-shadow: inset 0 -2px ${(props) => props.theme.colors.cyan[600]};
        }
    }
`;

const onTriggerNavButton = () => {
    const sidebar = document.getElementById('sidebar');

    if (sidebar) {
        sidebar.classList.toggle('active-nav');
    }
};

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const location = useLocation();
    const [showSidebar, setShowSidebar] = useState(false);
    const [showDrexMenu, setShowDrexMenu] = useState(false);

    useEffect(() => {
        if (location.pathname.startsWith('/server') || location.pathname.startsWith('/account')) {
            setShowSidebar(true);
            return;
        }
        setShowSidebar(false);
    }, [location.pathname]);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <div className={'bg-neutral-700 shadow-md overflow-x-auto topbar'}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'mx-auto w-full flex items-center h-[3.5rem] max-w-[1200px]'}>
                {showSidebar && (
                    <FontAwesomeIcon
                        icon={faBars}
                        className='navbar-button'
                        onClick={onTriggerNavButton}
                    ></FontAwesomeIcon>
                )}

                <div id={'logo'} className={'flex-1'}>
                    <Link
                        to={'/'}
                        className={
                            'text-2xl font-header font-medium px-4 no-underline text-neutral-200 hover:text-neutral-100 transition-colors duration-150'
                        }
                    >
                        {name}
                    </Link>
                </div>

                <RightNavigation className={'flex h-full items-center justify-center'}>
                    <SearchContainer />
                    <div className={'relative h-full flex items-center'}>
                        <button
                            type={'button'}
                            aria-expanded={showDrexMenu}
                            aria-haspopup={'menu'}
                            onClick={() => setShowDrexMenu((visible) => !visible)}
                            className={'flex items-center h-full no-underline text-orange-200 px-4 cursor-pointer transition-all duration-150 hover:text-white hover:bg-pink-950'}
                        >
                            <FontAwesomeIcon icon={faCoins} className={'mr-2'} />
                            Drex Menu
                        </button>
                        {showDrexMenu && (
                            <div role={'menu'} className={'absolute right-0 top-full z-50 min-w-[220px] rounded-b-lg border border-pink-500/40 bg-gray-900 p-2 shadow-xl'}>
                                <NavLink to={'/'} exact role={'menuitem'} className={'flex items-center rounded px-3 py-2 text-sm text-pink-100 no-underline hover:bg-pink-950'} onClick={() => setShowDrexMenu(false)}>
                                    <FontAwesomeIcon icon={faCoins} className={'mr-3 text-orange-400'} /> Coin balance
                                </NavLink>
                                <NavLink to={'/?panel=claim'} role={'menuitem'} className={'flex items-center rounded px-3 py-2 text-sm text-pink-100 no-underline hover:bg-pink-950'} onClick={() => setShowDrexMenu(false)}>
                                    <FontAwesomeIcon icon={faGift} className={'mr-3 text-orange-400'} /> Claim dashboard
                                </NavLink>
                                <NavLink to={'/?panel=create-server'} role={'menuitem'} className={'flex items-center rounded px-3 py-2 text-sm text-pink-100 no-underline hover:bg-pink-950'} onClick={() => setShowDrexMenu(false)}>
                                    <FontAwesomeIcon icon={faServer} className={'mr-3 text-orange-400'} /> Server creation dashboard
                                </NavLink>
                            </div>
                        )}
                    </div>
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin'}>
                            <a href={'/admin'} rel={'noreferrer'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}>
                            <span className={'flex items-center w-5 h-5'}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button onClick={onTriggerLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </div>
        </div>
    );
};
