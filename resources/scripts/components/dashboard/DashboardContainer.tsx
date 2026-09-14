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
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

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
                <div css={tw`mb-4 rounded-lg border border-pink-500/40 bg-gradient-to-r from-pink-950/70 via-slate-950 to-amber-950/60 p-4 shadow-lg shadow-pink-950/20`}>
                    <div css={tw`flex items-center justify-between gap-4`}>
                        <div>
                            <p css={tw`text-xs font-semibold uppercase tracking-wider text-pink-200`}>Nightshift balance</p>
                            <p css={tw`mt-1 text-2xl font-bold text-white`}>{account.coins} coins</p>
                            <p css={tw`mt-1 text-xs text-neutral-400`}>Create one server for {account.server_creation_cost} coins. Daily upkeep is {account.daily_server_cost} coins; claim {account.daily_claim_amount} coins each day or request coins from an admin.</p>
                        </div>
                        <div css={tw`rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200`}>
                            {account.server_count}/1 servers
                        </div>
                    </div>
                </div>
            )}
            <div css={tw`mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4`}>
                <a href="https://github.com" target="_blank" rel="noreferrer" css={tw`rounded-lg border border-pink-500/30 bg-pink-950/30 p-4 transition hover:border-pink-300`}>
                    <p css={tw`text-sm font-semibold text-pink-100`}>Get help on GitHub</p><p css={tw`mt-1 text-xs text-neutral-400`}>Report issues and read guides.</p>
                </a>
                <a href="https://wa.me/254703726139" target="_blank" rel="noreferrer" css={tw`rounded-lg border border-amber-500/30 bg-amber-950/30 p-4 transition hover:border-amber-300`}>
                    <p css={tw`text-sm font-semibold text-amber-100`}>Chat with owner</p><p css={tw`mt-1 text-xs text-neutral-400`}>WhatsApp the panel owner.</p>
                </a>
                <a href="https://wa.me/254703726139?text=I%20would%20like%20to%20buy%20you%20a%20coffee" target="_blank" rel="noreferrer" css={tw`rounded-lg border border-orange-500/30 bg-orange-950/30 p-4 transition hover:border-orange-300`}>
                    <p css={tw`text-sm font-semibold text-orange-100`}>Buy coffee</p><p css={tw`mt-1 text-xs text-neutral-400`}>Support Nightshift on WhatsApp.</p>
                </a>
                <div css={tw`rounded-lg border border-pink-500/30 bg-slate-950/60 p-4`}>
                    <p css={tw`text-sm font-semibold text-pink-100`}>Nightshift stats</p><p css={tw`mt-1 text-xs text-neutral-400`}>Servers: {account?.server_count ?? 0} · Users: — · Admin users: —</p>
                </div>
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
