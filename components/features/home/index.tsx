"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ICON_PATHS, IMAGE_PATHS } from "@/lib/assets";
import {
    setStoredTransactionCategory,
    TRANSACTION_CATEGORY,
} from "@/lib/transaction-storage";
import "./index.css"
import { useEffect, useState } from "react";

type PublicEnv = {
    appName: string;
    serverIp: string;
    version: string;
};

export default function HomeComp() {
    const router = useRouter();
    const [env, setEnv] = useState<PublicEnv | null>(null);

    const toCategory = (category: number) => {
        if (category === 1) {
            setStoredTransactionCategory(TRANSACTION_CATEGORY.WITHDRAW)
        } else {
            setStoredTransactionCategory(TRANSACTION_CATEGORY.DEPOSIT)
        }
        router.push("/e-form");
    }


    useEffect(() => {
        queueMicrotask(() => {
            setEnv(window.__ENV__);
        });
    }, []);

    return (
        <div className="homepage">
            <div className="title">
                <div className="ebranch-logo">eBranch</div>
                <Image
                    alt="logo-sumut"
                    className="ebranch-logo-sumut"
                    height={100}
                    priority
                    sizes="(max-width: 768px) 120px, 216px"
                    src={IMAGE_PATHS.sumutLogo}
                    width={216}
                />
            </div>
            <div className="line"></div>
            <div className="category">
                <div style={{ cursor: 'pointer' }} onClick={() => toCategory(1)} className="category-card">
                    <Image
                        alt="tunai"
                        className="icons"
                        height={120}
                        sizes="(max-width: 768px) 60px, 120px"
                        src={ICON_PATHS.tarikTunai}
                        width={120}
                    />
                    <div className="category-title">Tarikan Tunai</div>
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => toCategory(2)} className="category-card">
                    <Image
                        alt="tunai"
                        className="icons"
                        height={120}
                        sizes="(max-width: 768px) 60px, 120px"
                        src={ICON_PATHS.setorTunai}
                        width={120}
                    />
                    <div className="category-title">Setoran Tunai</div>
                </div>
            </div>
            <footer style={{ position: 'fixed', bottom: '0', right: '10px', color: 'white' }}>{env?.version}</footer>
        </div>
    )
}
