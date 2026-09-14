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

interface Account {
    coins: number;
    server_count: number;
    server_creation_cost: number;
    daily_server_cost: number;
    daily_claim_amount: number;
}

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
    const { data: account, error: accountError } = useSWR<Account>(
        '/api/client/account',
        async () => (await http.get('/api/client/account')).data.data.attributes
    );

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
        // Keep the selected dashboard panel in the URL while pagination changes.
        const params = new URLSearchParams(window.location.search);
        if (page <= 1) params.delete('page');
        else params.set('page', String(page));
        const queryString = params.toString();
        window.history.replaceState(null, document.title, `/${queryString ? `?${queryString}` : ''}`);
    }, [page]);

    useEffect(() => {
        const requestError = error || accountError;

        if (requestError) clearAndAddHttpError({ key: 'dashboard', error: requestError });
        if (!requestError) clearFlashes('dashboard');
    }, [error, accountError]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <div
                id={'coin-balance'}
                css={tw`mb-4 rounded-lg border border-pink-500/40 bg-gradient-to-r from-pink-900 via-gray-900 to-orange-900 p-4 shadow-lg`}
            >
                {activePanel && (
                    <p css={tw`mb-3 text-xs font-semibold uppercase tracking-widest text-orange-300`}>
                        {activePanel === 'claim'
                            ? 'Claim dashboard'
                            : activePanel === 'create-server'
                            ? 'Server creation dashboard'
                            : 'Coin balance'}
                    </p>
                )}
                {account ? (
                    <div css={tw`flex items-center justify-between gap-4`}>
                        <div>
                            <p css={tw`text-xs font-semibold uppercase tracking-wider text-pink-200`}>
                                Nightshift balance
                            </p>
                            <p css={tw`mt-1 text-2xl font-bold text-white`}>{account.coins} coins</p>
                            <p css={tw`mt-1 text-xs text-neutral-400`}>
                                Create one server for {account.server_creation_cost} coins. Daily upkeep is{' '}
                                {account.daily_server_cost} coins; claim {account.daily_claim_amount} coins each day or
                                request coins from an admin.
                            </p>
                        </div>
                        <div
                            css={tw`rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200`}
                        >
                            {account.server_count}/1 servers
                        </div>
                    </div>
                ) : accountError ? (
                    <p css={tw`text-sm text-neutral-300`}>
                        Your coin balance is temporarily unavailable. Please refresh and try again.
                    </p>
                ) : (
                    <Spinner centered size={'small'} />
                )}
            </div>
            {activePanel && (
                <div css={tw`mb-4 rounded-lg border border-pink-500/40 bg-gray-900 p-5 shadow-lg`}>
                    <p css={tw`text-lg font-semibold text-pink-100`}>
                        {activePanel === 'claim'
                            ? 'Claim dashboard'
                            : activePanel === 'create-server'
                            ? 'Server creation dashboard'
                            : 'Coin balance'}
                    </p>
                    {!account && !accountError && <Spinner centered size={'small'} />}
                    {accountError && (
                        <p css={tw`mt-2 text-sm text-neutral-300`}>
                            We could not load the dashboard details. Please refresh and try again.
                        </p>
                    )}
                    {account && activePanel === 'claim' && (
                        <>
                            <p css={tw`mt-2 text-sm text-neutral-300`}>
                                Claim your daily coin allowance to keep your server running.
                            </p>
                            <div css={tw`mt-4 flex flex-wrap items-center gap-3`}>
                                <span
                                    css={tw`rounded-full bg-pink-500/20 px-3 py-2 text-sm font-semibold text-pink-200`}
                                >
                                    {account.daily_claim_amount} coins available daily
                                </span>
                                <button
                                    type={'button'}
                                    disabled
                                    css={tw`cursor-not-allowed rounded-md bg-pink-600/50 px-4 py-2 text-sm font-semibold text-white/70`}
                                >
                                    Claim coming soon
                                </button>
                            </div>
                        </>
                    )}
                    {account && activePanel === 'create-server' && (
                        <>
                            <p css={tw`mt-2 text-sm text-neutral-300`}>
                                Create a server when your balance covers the current setup cost.
                            </p>
                            <div css={tw`mt-4 flex flex-wrap gap-3 text-sm`}>
                                <span css={tw`rounded-full bg-orange-500/20 px-3 py-2 text-orange-200`}>
                                    Setup cost: {account.server_creation_cost} coins
                                </span>
                                <span css={tw`rounded-full bg-gray-800 px-3 py-2 text-neutral-300`}>
                                    Available: {account.coins} coins
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}
            {!activePanel && (
                <>
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
                                        <ServerRow
                                            key={server.uuid}
                                            server={server}
                                            css={index > 0 ? tw`mt-2` : undefined}
                                        />
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
                </>
            )}
        </PageContentBlock>
    );
};
