import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";

export const metadata = {
	title: "Wordify - Extract text from Images,",
	description:
		"Extract text from images using OCR and converted extractet text to PDF format.",
};

const inter = Inter({ style: "normal", subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<meta
					name="google-site-verification"
					content="12z_9nW2zfWHVbFZYYsPch9kjz6NZNJ1Kh3m-q3lPDk"
				/>
			</head>
			<body className={`${inter.className} antialiased`}>
				<main>{children}</main>
				<Toaster />
			</body>
		</html>
	);
}
