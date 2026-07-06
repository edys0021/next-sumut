import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { env } from "@/config/env";
import d from "@/lib/decryptor";
``
export function useRecNumbApi() {
    const [loading, setLoading] = useState(false);

    const getName = async (payload: {
        timestamp: string;
        content: string;
    }) => {
        setLoading(true);

        try {
            const { data } = await axios.post(
                `${env.serverIp}/account-number/get-validation`,
                payload,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            const { content } = data;
            const { accountName, branchId } = JSON.parse(d(content));

            Cookies.set("branchId", branchId, {
                expires: 1,
            });

            return {
                success: true,
                accountName,
            };
        } catch (error) {
            return {
                success: false,
                accountName: "",
                error,
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        getName,
    };
}