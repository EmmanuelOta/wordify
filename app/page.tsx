"use client";

import { Button } from "@/components/ui/button";
import {
	Plus,
	Image,
	File,
	Download,
	ChevronRight,
	Instagram,
	Linkedin,
	Twitter,
	ExternalLink,
	ChevronDown,
} from "lucide-react";
import Dropzone from "react-dropzone";
import { FeedbackWidget } from "@mindship/react";

import { Libre_Baskerville } from "next/font/google";
import React, { useState, useEffect, useRef } from "react";

import { useToast } from "@/hooks/use-toast";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const libre_baskerville = Libre_Baskerville({
	weight: "400",
	subsets: ["latin"],
	style: "italic",
});

export default function Home() {
	const [files, setFiles] = useState<File[]>([]);

	//state to manage converted pdf files
	const [pdf_file, setPdfFile] = useState<Blob | null>(null);

	//state to manage convertde text files
	const [text_file, setTextFile] = useState<Blob | null>(null);

	const [loading, setLoading] = useState<boolean>(false);

	const { toast } = useToast();

	//state for handling dropzone focus
	const [dropzone_focused, setdropzoneFocused] = useState<boolean>(false);

	//ref for add more files input element
	const add_more_files_ref = useRef<null | HTMLInputElement>(null);

	//state for managing file size limit
	const [max_file_size, setMaxFileSize] = useState(false);

	//list of social media handles
	const social_handles = [
		{
			name: "Twitter",
			link: "https://x.com/coder_zi",
			icon: <Twitter className="size-5" />,
		},
		{
			name: "Instagram",
			link: "https://instagram.com/coder_zi",
			icon: <Instagram className="size-5" />,
		},
		{
			name: "LinkedIn",
			link: "https://linkedin.com/in/coder-zi",
			icon: <Linkedin className="size-5" />,
		},
	];

	//state for handling social media popover UI
	const [is_social_popover_open, setSocialPopoverOpen] = useState(false);

	//ref for popover
	const popover_ref = useRef<null | HTMLDivElement>(null);

	//useEffect for monitoring if click occured inside the popover, if not close popover
	useEffect(() => {
		if (!is_social_popover_open) {
			return;
		}

		const handleClick = (e: MouseEvent) => {
			if (popover_ref.current?.contains(e.target as Node)) {
				return;
			}

			setSocialPopoverOpen(false);
		};

		document.addEventListener("click", handleClick);

		return () => {
			document.removeEventListener("click", handleClick);
		};
	}, [is_social_popover_open]);

	//useEffect to check if any file sizes are equal to or greater than 32mb
	useEffect(() => {
		files.forEach((file) => {
			if (file.size >= 33554432) {
				setMaxFileSize(true);
			} else {
				setMaxFileSize(false);
			}
		});
	}, [files]);

	const onDrop = (accepted_files: File[]) => {
		setdropzoneFocused(false);

		//accepted mime types for word files
		const accepted_mime_types = ["image/jpg", "image/jpeg", "image/png"];

		//iterate through accepted files and throw error on invalid types
		accepted_files.forEach((file) => {
			if (accepted_mime_types.includes(file.type)) {
				return;
			}

			toast({
				variant: "destructive",
				title: "Invalid file type",
				description: `${file.name} has an invalid type!!`,
			});
		});

		//extract image files from file array
		const images = accepted_files.filter((file) =>
			accepted_mime_types.includes(file.type)
		);

		setFiles(images);
	};

	//function to remove a file from files array
	const removeFile = (index: number) => {
		const copy = [...files];
		copy.splice(index, 1);
		setFiles(copy);
	};

	const handleSelectedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files as FileList;
		setFiles((current_files) => [...current_files, ...files]);
	};

	const downloadPdf = () => {
		const link = document.createElement("a");
		link.href = URL.createObjectURL(pdf_file as Blob);
		link.download = `wordify-pdf.pdf`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	};

	const downloadTextFile = () => {
		const link = document.createElement("a");
		link.href = URL.createObjectURL(text_file as Blob);
		link.download = "wordify-text.txt";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	};

	const uploadFile = async () => {
		try {
			setLoading(true);

			//first loop through image files and attach them to a form data
			const img_file_formdata = new FormData();
			for (let i = 0; i < files.length; i++) {
				img_file_formdata.append("images", files[i]);
			}
			//make a request to the express api endpoint in to convert pdf to text;
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_WORDIFY_BACKEND}`,
				{
					method: "POST",
					body: img_file_formdata,
				}
			);

			if (!response.ok) {
				throw new Error("An error occured: ");
			}

			const { pdf, text } = await response.json();

			// Convert base64 PDF to Blob
			const pdf_binary = atob(pdf);
			const pdf_array = new Uint8Array(pdf_binary.length);
			for (let i = 0; i < pdf_binary.length; i++) {
				pdf_array[i] = pdf_binary.charCodeAt(i);
			}
			const pdf_blob = new Blob([pdf_array], { type: "application/pdf" });

			// Convert base64 text to Blob
			const text_blob = new Blob([atob(text)], { type: "text/plain" });

			setPdfFile(pdf_blob);
			setTextFile(text_blob);
			setFiles([]);

			toast({
				variant: "default",
				title: "Success!",
				description: "Text extracted and PDF generated successfully",
			});
		} catch (error) {
			console.error(error);
			//display error with toastify
			toast({
				variant: "destructive",
				title: "Network Error",
				description: `We failed to process your file(s), check your internet connection and try again`,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<section className="flex flex-col items-center justify-center p-4 space-y-8 bg-gradient-to-b from-zinc-50 via-zinc-200 to-zinc-100">
				<div>
					<img
						src="/images/wordify.jpeg"
						width={200}
						height={200}
						className="rounded-full"
					/>
				</div>
				<div
					className={`text-center font-semibold text-2xl mt-8 ${libre_baskerville.className}`}
				>
					Extract text from Images using our tool
				</div>

				{files.length === 0 && !pdf_file && (
					<div className="md:w-[80%]">
						<Dropzone
							onDrop={onDrop}
							onDragEnter={() => setdropzoneFocused(true)}
							onDragLeave={() => {
								setdropzoneFocused(false);
							}}
						>
							{({ getRootProps, getInputProps }) => (
								<div
									className={
										dropzone_focused
											? "bg-zinc-200 flex flex-col justify-center items-center my-9 mx-9 py-9 p-20 border border-zinc-300 md:ml-20 md:p-15 lg:p-36 rounded-lg"
											: "bg-zinc-100 flex flex-col justify-center items-center my-9 mx-9 py-9 p-20 border border-zinc-300 md:ml-20 md:p-15 lg:p-36 rounded-lg"
									}
									{...getRootProps()}
								>
									<Button
										variant={"default"}
										className="py-5"
									>
										Upload Images
									</Button>
									<input
										{...getInputProps()}
										accept=".png, .jpg, .jpeg"
										className="hidden"
									/>
									<p className="mt-6 text-center font-semibold ">
										Or drag and drop images here
									</p>
								</div>
							)}
						</Dropzone>
					</div>
				)}

				{files.length !== 0 && !pdf_file && (
					<div className="flex flex-col items-center justify-center p-4 border border-zinc-300 shadow-md bg-gradient-to-b from-zinc-100 to-zinc-200 rounded-lg w-[95%] md:w-[80%] mb-14">
						{/*Add more files button */}
						<div className="container mx-auto flex items-center justify-end my-3">
							<Button
								variant={"default"}
								onClick={() =>
									add_more_files_ref.current?.click()
								}
								className={`py-5 ${
									loading
										? "cursor-not-allowed"
										: "cursor-pointer"
								}`}
							>
								<Plus className="mx-1 size-5 text-white" />
								Add more files
							</Button>
							<input
								type="file"
								ref={add_more_files_ref}
								accept="jpg, .jpeg, .png"
								multiple
								className={`hidden ${
									loading
										? "cursor-not-allowed"
										: "cursor-pointer"
								}`}
								disabled={loading ? true : false}
								onChange={handleSelectedFile}
							/>
						</div>
						{files.map((file, index) => (
							<div
								className="flex flex-row justify-between align-center border border-zinc-400 rounded-lg p-3 text-zinc-800 text-white m-3 w-full bg-gradient-to-r from-zinc-50 to-zinc-100"
								key={index}
							>
								<div
									className="font-semibold w-full flex align-baseline items-center mx-1 md:mx-7 truncate max-w-full"
									title={file.name}
								>
									<div className="hidden md:flex">
										<Image className="mx-1 size-5" />
									</div>
									<p className="text-xs md:text-sm truncate w-full md:w-max p-2">
										{file.name}
									</p>
								</div>
								<div className="container mx-7 flex items-center justify-center">
									<p className="bg-green-700 text-white font-semibold p-1 px-2 text-[10px] rounded-3xl">
										Ready
									</p>
								</div>
								<div className="flex items-center justify-center text-sm font-medium">
									{file.size.toString().length <= 5 ? (
										<p className="inline-flex w-max">
											{(file.size / 1024).toFixed(2)} KB
										</p>
									) : (
										<p className="inline-flex w-max">
											{(file.size / 1048576).toFixed(2)}{" "}
											MB
										</p>
									)}
								</div>
								<button
									title="Remove file"
									onClick={() => removeFile(index)}
									disabled={loading ? true : false}
									className="flex items-center justify-baseline mx-5 cursor-pointer hover:bg-zinc-300 rounded-md disabled:cursor-not-allowed"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
										className="w-10 h-5 px-2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18 18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						))}

						<div className="w-full p-4 rounded-lg bg-zinc-100 border border-zinc-300 my-2">
							<Button
								className={`py-5 ${
									loading || max_file_size
										? "cursor-not-allowed"
										: "cursor-pointer [&>*:last-child]:hover:translate-x-1 [&>*:last-child]:ease-in-out [&>*:last-child]:duration-200"
								}`}
								onClick={uploadFile}
								disabled={
									loading || max_file_size ? true : false
								}
								title={`${
									loading
										? "Extracting text from image(s)..."
										: "Extract text from image"
								}`}
							>
								{loading ? (
									<>
										{"Extracting..."}
										<svg
											aria-hidden="true"
											className="w-5 h-5 text-gray-200 animate-spin fill-white ml-3"
											viewBox="0 0 100 101"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
												fill="currentColor"
											/>
											<path
												d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
												fill="currentFill"
											/>
										</svg>
									</>
								) : (
									<>
										Extract
										<span className="mx-1">-&gt;</span>
									</>
								)}
							</Button>
							{max_file_size ? (
								<p className="text-red-300 text-sm font-semibold mx-5 my-2">
									File size limit of a single file is 32mb.
								</p>
							) : (
								""
							)}
						</div>
					</div>
				)}

				{pdf_file && (
					<div className="flex flex-col bg-gradient-to-l from-zinc-50 to-zinc-100 items-center justify-center p-4 rounded-lg w-[95%] md:w-[80%] mb-14 shadow-md">
						<h4 className="font-semibold text-2xl text-zinc-800 text-center p-2">
							Download your PDF
						</h4>
						<div className="my-4 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-100 via-zinc-50 to-zinc-200 rounded-lg border border-zinc-200 w-full p-4">
							<div className="w-full flex flex-row justify-between align-center border border-zinc-200 rounded-lg p-3 text-center text-zinc-800 w-full bg-gradient-to-b from-zinc-50 to-zinc-100">
								<div
									className="font-semibold w-full flex flex-row align-baseline items-center truncate mx-1 md:mx-7"
									title={`wordify-pdf.pdf`}
								>
									<div className="hidden md:flex">
										<File className="mx-[2px] size-5" />
									</div>
									<p className="text-xs md:text-sm truncate w-full md:w-max p-2">
										{`wordify-pdf.pdf`}
									</p>
								</div>

								<div className="container mx-7 flex items-center justify-center">
									<p className="bg-green-700 text-white font-semibold p-1 px-2 text-[13px] rounded-3xl">
										Ready
									</p>
								</div>

								<div className="flex items-center justify-center text-sm font-medium">
									{pdf_file.size.toString().length <= 5 ? (
										<p>
											{(pdf_file.size / 1024).toFixed(2)}{" "}
											KB
										</p>
									) : (
										<p>
											{(pdf_file.size / 1048576).toFixed(
												2
											)}{" "}
											MB
										</p>
									)}
								</div>
							</div>

							<div className="flex items-center justify-center py-5 rounded-lg border border-zinc-300 w-full my-5">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="default"
											className="py-5 w-[50%]"
										>
											Download
											<ChevronDown className="mx-1 h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem onClick={downloadPdf}>
											Download PDF
											<Download className="mx-1 size-4" />
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={downloadTextFile}
										>
											Download Text
											<Download className="mx-1 size-4" />
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>
				)}

				<div className="w-full p-4 flex flex-col items-center justify-center ">
					<div
						className="flex flex-row items-center justify-center p-4 bg-zinc-950 text-white rounded-3xl space-x-2 w-[70%] md:w-[30%] cursor-pointer [&>*:last-child]:hover:translate-x-1 [&>*:last-child]:ease-in-out [&>*:last-child]:duration-200"
						onClick={() =>
							setSocialPopoverOpen(!is_social_popover_open)
						}
					>
						<img
							width={25}
							height={25}
							className="rounded-full"
							alt="coder_zi"
							src="/images/coder_zi.png"
						/>
						<span className="text white font-medium">
							Built by @coder_zi
						</span>
						<ChevronRight className="mx-2 size-5" />
					</div>

					<div className="relative w-full p-4">
						<div
							className={`absolute top-[5%] left-[45%] w-[50%] p-2 w-max space-y-2 bg-zinc-900 text-white font-medium rounded-lg ${
								is_social_popover_open ? "block" : "hidden"
							}`}
						>
							{social_handles.map((social_handle) => (
								<div key={social_handle.name}>
									<a
										href={social_handle.link}
										target="_blank"
										className="flex items-center justify-center space-x-2 hover:bg-zinc-800 p-2 rounded-md font-semibold"
									>
										<span>{social_handle.icon}</span>
										<span>{social_handle.name}</span>
									</a>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="flex flex-col items-center justify-center bg-gradient-to-r from-zinc-50 via-zinc-200 to-zinc-100">
				<div className="flex w-full items-center justify-center my-6">
					<div className="flex flex-col items-center justify-center space-y-3 w-[90%] lg:w-[40%]">
						<p className="text-lg font-medium text-center">
							I built a tool that converts PDF, DOC, DOCX files
							into human sounding audio books
						</p>
						<img
							src="/images/clipifai.png"
							width={400}
							className="rounded-lg"
						/>
						<a
							className="inline-flex items-center justify-center w-full gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-3"
							href="https://clipifai.vercel.app"
							target="_blank"
						>
							Check it out
							<ExternalLink className="mx-1 size-5" />
						</a>
					</div>
				</div>
			</section>

			<FeedbackWidget
				teamId={process.env.NEXT_PUBLIC_MINDSHIP_TEAM_ID!}
				title="Rate your experience"
				description="Your feedback helps us improve"
				position="bottom-right"
				primaryColor="#0066ff"
				textColor="#333333"
			/>
		</>
	);
}
