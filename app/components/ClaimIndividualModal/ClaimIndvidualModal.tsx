"use client";
import { ArrowDownToLine, Share2 } from "lucide-react";
import { useState } from "react";
import { CloseIcon } from "../Icons/CloseIcon";
import { TwitterIcon } from "../Icons/TwitterIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

interface ClaimButtonProps {
    userId?: string;
    rewardAmount?: number;
    transactionHash?: string;
    questionIds: number[];
}

function ClaimIndvidualModal({
    userId,
    rewardAmount,
    transactionHash,
    questionIds
}: ClaimButtonProps) {
    const [openClaimShareModal, setOpenClaimShareModal] = useState(false);

    
    return (
        <div className="w-full">
            <Button
                onClick={() => setOpenClaimShareModal(true)}
                className={`text-[14px] gap-2 w-full`}
                variant="outline"
            >
                Share & Earn More
                <Share2 />
            </Button>
            <Drawer
                open={openClaimShareModal}
                onOpenChange={(open: boolean) => {
                    if (!open) {
                        setOpenClaimShareModal(false);
                    }
                }}
            >
                <DrawerContent>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setOpenClaimShareModal(false);
                        }}
                        className="absolute top-5 right-6 border-none w-max !p-0 z-50"
                    >
                        <CloseIcon width={16} height={16} />
                    </Button>
                    <div className="flex flex-col gap-6 pt-6 px-6 pb-6">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-row w-full items-center justify-between">
                                <h3 className="text-secondary text-[16px]">
                                    Share your result!
                                </h3>
                            </div>
                            <p className="text-[14px]">
                                You won {rewardAmount} BONK for your correct answer.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/og/share-individual?burnTx=${transactionHash}&userId=${userId}&questionIds=${questionIds}`}
                                alt="Claim All image"
                                className="p-4 w-[100%] h-auto"
                            // ref={imgRef}
                            />
                        </div>

                        <div className="flex flex-row px-5 justify-between">
                            <Button
                                variant="ghost"
                                className="bg-purple-200 text-gray-900 rounded-full w-[40px] h-[40px]"
                            //  onClick={handleDownload}
                            >
                                <ArrowDownToLine />
                            </Button>
                            <Button
                                variant="ghost"
                                className="bg-purple-200 text-gray-900 rounded-full w-[40px] h-[40px]"
                            // onClick={handleTwitterShare}
                            >
                                <TwitterIcon />
                            </Button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

export default ClaimIndvidualModal;
