import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";

export const metadata = {
	title: "Wordify - Extract text from Images,",
	description: "Extract text from images using OCR",
};

const inter = Inter({ style: "normal", subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head></head>
			<body className={`${inter.className} antialiased`}>
				<main>{children}</main>
				<Toaster />
			</body>
		</html>
	);
}
