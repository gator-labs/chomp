import * as React from 'react';
import Image from "next/image";
import { Button } from './components/ui/button';
import { BackIcon } from './components/Icons/BackIcon';
import { HomeIcon } from './components/Icons/HomeIcon';
// import { useRouter } from "next-nprogress-bar";
import ProfileNavigation from './components/ProfileNavigation/ProfileNavigation';
import { TabNavigation } from './components/TabNavigation/TabNavigation';
import { getCurrentUser } from './queries/user';
import { getTransactionHistory } from './actions/fungible-asset';
import { getBonkBalance, getSolBalance } from './utils/solana';
import { Navbar } from './components/Navbar/Navbar';
import { redirect } from 'next/navigation'
import Link from "next/link";
import { NextRequest } from 'next/server';


const notFound = async () => {
    const [user, history] = await Promise.all([
        getCurrentUser(),
        getTransactionHistory(),
    ]);

    const address = user?.wallets[0].address || "";

    const [bonkBalance, solBalance] = await Promise.all([
        getBonkBalance(address),
        getSolBalance(address),
    ]);
    // const router = useRouter();

    return (
        <div className="flex flex-col font-sora bg-gray-950 text-white h-full w-[30%] mx-auto pt-14 gap-2">
            <Navbar
                avatarSrc={user?.profileSrc || ""}
                bonkBalance={bonkBalance}
                solBalance={solBalance}
                transactions={history.map((h) => ({
                    amount: h.change.toNumber(),
                    amountLabel: h.asset + "s",
                    transactionType: h.type,
                    date: h.createdAt,
                }))}
                address={address}
            />
            <div className="bg-gray-800 rounded-xl relative">
                <Image
                    src="/images/eroor-bg-attern.svg"
                    alt="Background Cover"
                    className="object-cover w-full h-full rounded-lg"
                    width={180}
                    height={20}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-purple-200 text-[96px] font-bold">404</p>
                </div>
            </div>

            <div className="flex flex-col items-start text-white mt-2 gap-2">
                <p className="text-base mb-2">Page not found. Let&apos; s go somewhere else!</p>
                <p className="text-base mb-2">Optional error description</p>
                <p className="text-base">(stack trace, other technical info that may be helpful for debugging)</p>
            </div>

            <div className='flex flex-col mt-auto gap-4 mb-8'>
                {/* <Link href="/application" className='w-full'> */}
                    <Button size="lg"
                        className="gap-1 w-full">
                        Return home
                        <HomeIcon />
                    </Button>
                {/* </Link> */}
                <Button size="lg" variant="outline" className="gap-1">
                    <BackIcon />
                    Back to previous page
                </Button>
            </div>
            <TabNavigation isAdmin={!!user?.isAdmin} />
        </div>
    );
}

export default notFound;
