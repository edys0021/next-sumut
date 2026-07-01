"use client";

import { useRouter } from "next/navigation";
import "./index.css"


export default function HomeComp() {
    const router = useRouter();

    const toCategory = (category : number) => {
        if (category === 1) {
            localStorage.setItem("category", "1")
        } else {
            localStorage.setItem("category", "2")
        }
        router.push("/e-form");
    }

    return (
        <div className="homepage">
            <div className="title">
                <div className="ebranch-logo">eBranch</div>
                <img src="assets/images/sumut-logo.png" className="ebranch-logo-sumut" alt='logo-sumut' />
            </div>
            <div className="line"></div>
            <div className="category">
                <div style={{ cursor: 'pointer' }} onClick={() => toCategory(1)} className="category-card">
                    <img className="icons" src="assets/icons/tarik.png" alt="tunai" />
                    <div className="category-title">Tarikan Tunai</div>
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => toCategory(2)} className="category-card">
                    <img className="icons" src="assets/icons/setor.png" alt="tunai" />
                    <div className="category-title">Setoran Tunai</div>
                </div>
            </div>
            <footer style={{ position: 'fixed', bottom: '0', right: '10px', color: 'white' }}>v.1.1.4</footer>
        </div>
    )
}