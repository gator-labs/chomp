import React, { ReactNode, CSSProperties } from 'react';
import Image from "next/image";
import gatorHeadImage from "@/public/images/gator-head.png";
import classNames from 'classnames';

interface QuestionCardLayoutProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}

function QuestionCardLayout({ children, style, className }: QuestionCardLayoutProps) {
    return (
        <div className={classNames("bg-gray-700 h-[350px] w-full max-w-[480px] rounded-xl pt-6 pl-4 pr-4 flex flex-col justify-between border border-gray-500 text-white relative mb-[4px] overflow-scroll", className)} style={style} >
            {children}
            <Image
                src={gatorHeadImage}
                alt="gator-head"
                className="absolute bottom-0 left-0 w-full"
                style={{ zIndex: 1 }}
            />
        </div>
    );
}

export default QuestionCardLayout;
