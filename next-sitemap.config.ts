import { IConfig } from "next-sitemap";

const config: IConfig = {
	siteUrl: process.env.SITE_URL || "https://yourdomain.com",
	generateRobotsTxt: true, // Generate a robots.txt file
	sitemapSize: 5000, // Limit the number of URLs per sitemap file
};

export default config;
