import React from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import { useLocation } from 'react-router';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import Spinner from '@/components/elements/Spinner';
import routes from '@/routers/routes';
import Sidebar from '@/components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCoins, faGift, faLayerGroup, faServer, faComments, faLifeRing, faMugHot } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const location = useLocation();
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);

    return (
        <>
            <NavigationBar />
            <Sidebar>
                    <NavLink to={'/'} exact>
                        <div className='icon'><FontAwesomeIcon icon={faCoins} /></div>
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
                    {rootAdmin && (
                        <NavLink to={'/admin/users?view=coin-requests'}>
                            <div className='icon'><FontAwesomeIcon icon={faCoins} /></div>
                            Coin requests
                        </NavLink>
                    )}
                    <a href={'https://github.com/Tennor-modz/Fixes'} target={'_blank'} rel={'noreferrer'}>
                        <div className='icon'><FontAwesomeIcon icon={faLifeRing} /></div>
                        Get help on GitHub
                    </a>
                    <a href={'https://wa.me/254703726139'} target={'_blank'} rel={'noreferrer'}>
                        <div className='icon'><FontAwesomeIcon icon={faComments} /></div>
                        Chat with owner
                    </a>
                    <a href={'https://wa.me/254703726139?text=I%20would%20like%20to%20buy%20you%20a%20coffee'} target={'_blank'} rel={'noreferrer'}>
                        <div className='icon'><FontAwesomeIcon icon={faMugHot} /></div>
                        Buy coffee
                    </a>
                    {routes.account.map(({ path, name, exact = false, iconProp }) => name ? (
                        <NavLink key={path} to={`/account/${path}`.replace('//', '/')} exact={exact}>
                            <div className='icon'><FontAwesomeIcon icon={iconProp as IconProp} /></div>
                            {name}
                        </NavLink>
                    ) : null)}
                </Sidebar>

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
