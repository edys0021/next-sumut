"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

import { AppConfig } from "@/types/app-config";
import MainLayout from "@/components/layout/main-layout";

const ConfigContext = createContext<AppConfig | null>(null);

type ConfigProviderProps = {
    children: ReactNode;
};

export function ConfigProvider({
    children,
}: ConfigProviderProps) {

    const [config, setConfig] = useState<AppConfig | null>(null);

    useEffect(() => {

        async function loadConfig() {

            const response = await fetch("/config.json");

            const json: AppConfig = await response.json();

            setConfig(json);
        }

        loadConfig();

    }, []);

    if (!config) {
        return (
            <MainLayout>
                <div className="main-layout flex justify-center items-center">
                    <img width="72" height="72" src="assets/images/loading.gif" />
                </div>
            </MainLayout>
        );
    }

    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {

    const context = useContext(ConfigContext);

    if (!context) {
        throw new Error("useConfig must be used inside ConfigProvider");
    }

    return context;
}