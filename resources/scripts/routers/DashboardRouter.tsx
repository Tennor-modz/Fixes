import React from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import { useLocation } from 'react-router';
import Spinner from '@/components/elements/Spinner';
import routes from '@/routers/routes';
import Sidebar from '@/components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGift, faLayerGroup, faServer } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const location = useLocation();

    return (
        <>
            <NavigationBar />
            {(location.pathname === '/' || location.pathname.startsWith('/account')) && (
                <Sidebar>
                    {location.pathname === '/' && (
                        <>
                            <NavLink to={'/'} exact>
                                <div className='icon'><FontAwesomeIcon icon={faLayerGroup} /></div>
                                Coin balance
                            </NavLink>
                            <NavLink to={'/?panel=claim'}>
                                <div className='icon'><FontAwesomeIcon icon={faGift} /></div>
                                Claim dashboard
                            </NavLink>
                            <NavLink to={'/?panel=create-server'}>
                                <div className='icon'><FontAwesomeIcon icon={faServer} /></div>
                                Server creation dashboard
                            </NavLink>
                        </>
                    )}
                    {location.pathname.startsWith('/account') && (
                        routes.account
                            .filter((route) => !!route.name)
                            .map(({ path, name, exact = false, iconProp }) => (
                                <NavLink key={path} to={`/account/${path}`.replace('//', '/')} exact={exact}>
                                    <div className='icon'>
                                        <FontAwesomeIcon icon={iconProp as IconProp} />
                                    </div>
                                    {name}
                                </NavLink>
                            ))
                    )}
                </Sidebar>
            )}

            <TransitionRouter>
                <React.Suspense fallback={<Spinner centered />}>
                    <Switch location={location}>
                        <Route path={'/'} exact>
                            <DashboardContainer />
                        </Route>
                        {routes.account.map(({ path, component: Component }) => (
                            <Route key={path} path={`/account/${path}`.replace('//', '/')} exact>
                                <Component />
                            </Route>
                        ))}
                        <Route path={'*'}>
                            <NotFound />
                        </Route>
                    </Switch>
                </React.Suspense>
            </TransitionRouter>
        </>
    );
};
