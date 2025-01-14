import Script from "next/script";

const GoogleAnalytics = () => {
	const GA_MEASUREMENT_ID = "G-J56X4H5DDZ";
	return (
		<>
			<Script
				strategy="afterInteractive"
				src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
			/>
			<Script
				id="google-analytics"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
				}}
			/>
		</>
	);
};

export default GoogleAnalytics;
