"use client";
import * as React from 'react';
import Image from "next/image";
import { Button } from './components/ui/button';
import { BackIcon } from './components/Icons/BackIcon';
import { HomeIcon } from './components/Icons/HomeIcon';



function notFound() {

    return (
        <div className="flex flex-col font-sora bg-gray-950 text-white h-full items-center mx-auto">
            <div className="bg-gray-800 rounded-xl relative">
                <Image
                    src="/images/eroor-bg-attern.svg"
                    alt="Background Cover"
                    className="object-cover w-full h-full rounded-lg"
                    width={180}
                    height={20}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-purple-200 text-7xl font-bold">404</p>
                </div>
            </div>

            <div className="flex flex-col items-start text-white mt-2 w-85">
                <p className="text-base mb-2">Page not found. Let's go somewhere else!</p>
                <p className="text-base mb-2">Optional error description</p>
                <p className="text-base">(stack trace, other technical info that may be helpful for debugging)</p>
            </div>

            <div className='flex flex-col mt-auto gap-4'>
                <Button size="lg">
                    Return home
                    <HomeIcon />
                </Button>
                <Button size="lg" variant="outline">
                    <BackIcon />
                    Back to previous page
                </Button>
            </div>
            {/* <TabNavigation isAdmin={false} /> */}
        </div>
    );
}

export default notFound;
