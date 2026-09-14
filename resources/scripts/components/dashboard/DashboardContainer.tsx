import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import http from '@/api/http';

export default () => {
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const defaultPage = Number(query.get('page') || '1');
    const activePanel = query.get('panel');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );
    const { data: account } = useSWR('/api/client/account', async () => (await http.get('/api/client/account')).data.data.attributes);
    const { data: stats } = useSWR('/api/client/stats', async () => (await http.get('/api/client/stats')).data.data.attributes);

    useEffect(() => {
        setPage(1);
    }, [showOnlyAdmin]);

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            {account && (
                <div id={'coin-balance'} css={tw`mb-4 rounded-lg border border-pink-500/40 bg-gradient-to-r from-pink-900 via-gray-900 to-orange-900 p-4 shadow-lg`}>
                    {activePanel && (
                        <p css={tw`mb-3 text-xs font-semibold uppercase tracking-widest text-orange-300`}>
                            {activePanel === 'claim' ? 'Claim dashboard' : activePanel === 'create-server' ? 'Server creation dashboard' : 'Coin balance'}
                        </p>
                    )}
                    <div css={tw`flex items-center justify-between gap-4`}>
                        <div>
                            <p css={tw`text-xs font-semibold uppercase tracking-wider text-pink-200`}>Nightshift balance</p>
                            <p css={tw`mt-1 text-2xl font-bold text-white`}>{account.coins} coins</p>
                            <p css={tw`mt-1 text-xs text-neutral-400`}>Create one server for {account.server_creation_cost} coins. Daily upkeep is {account.daily_server_cost} coins; claim {account.daily_claim_amount} coins each day or request coins from an admin.</p>
                        </div>
                        <div css={tw`rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200`}>
                            {account.server_count}/1 servers
                        </div>
                    </div>
                </div>
            )}
            <div css={tw`mb-4 rounded-lg border border-pink-500/30 bg-gray-900 p-4`}>
                <p css={tw`text-sm font-semibold text-pink-100`}>Nightshift stats</p>
                <p css={tw`mt-1 text-xs text-neutral-400`}>
                    {stats ? `Servers: ${stats.servers} · Users: ${stats.users} · Admin users: ${stats.admin_users}` : 'Loading live statistics...'}
                </p>
            </div>
            {rootAdmin && (
                <div css={tw`mb-2 flex justify-end items-center`}>
                    <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                        {showOnlyAdmin ? "Showing others' servers" : 'Showing your servers'}
                    </p>
                    <Switch
                        name={'show_all_servers'}
                        defaultChecked={showOnlyAdmin}
                        onChange={() => setShowOnlyAdmin((s) => !s)}
                    />
                </div>
            )}
            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) =>
                        items.length > 0 ? (
                            items.map((server, index) => (
                                <ServerRow key={server.uuid} server={server} css={index > 0 ? tw`mt-2` : undefined} />
                            ))
                        ) : (
                            <p css={tw`text-center text-sm text-neutral-400`}>
                                {showOnlyAdmin
                                    ? 'There are no other servers to display.'
                                    : 'There are no servers associated with your account.'}
                            </p>
                        )
                    }
                </Pagination>
            )}
        </PageContentBlock>
    );
};
