"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Image } from "lucide-react";
import { File } from "lucide-react";
import { Download } from "lucide-react";
import Dropzone from "react-dropzone";

import { Libre_Baskerville } from "next/font/google";
import React, { useState, useEffect, useRef } from "react";

import { useToast } from "@/hooks/use-toast";

const libre_baskerville = Libre_Baskerville({
	weight: "400",
	subsets: ["latin"],
	style: "italic",
});

export default function Home() {
	const [files, setFiles] = useState<File[]>([]);

	//state to manage converted pdf files
	const [pdf_file, setPdfFiles] = useState<Blob | null>(null);

	const [loading, setLoading] = useState<boolean>(false);

	const { toast } = useToast();

	//state for handling dropzone focus
	const [dropzone_focused, setdropzoneFocused] = useState<boolean>(false);

	//ref for add more files input element
	const add_more_files_ref = useRef<null | HTMLInputElement>(null);

	//state for managing file size limit
	const [max_file_size, setMaxFileSize] = useState(false);

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

	const downloadSingleFile = (file: Blob) => {
		const link = document.createElement("a");
		link.href = URL.createObjectURL(file);
		link.download = `wordify-pdf.pdf`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	};

	const downloadAllFiles = () => {
		const link = document.createElement("a");
		link.href = URL.createObjectURL(pdf_file as Blob);
		link.download = `wordify-pdf.pdf`;
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

			const pdf_blob = await response.blob();

			/** const pdf_blob = new Blob([img_converted_pdf], {
				type: "application/pdf",
			});*/

			setPdfFiles(pdf_blob);

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
			setFiles([]);
		}
	};

	return (
		<>
			<section className="flex flex-col items-center justify-center p-4 space-y-8">
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

				{files.length === 0 && (
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
											? "bg-zinc-50 flex flex-col justify-center items-center my-9 mx-9 py-9 p-20 border border-zinc-300 md:ml-20 md:p-15 lg:p-36 rounded-lg"
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

				{files.length !== 0 && (
					<div className="flex flex-col items-center justify-center p-4 bg-gradient-to-l from-zinc-50 to-zinc-100 rounded-lg w-[95%] md:w-[80%] mb-10">
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
								<div
									title="Remove file"
									onClick={() => removeFile(index)}
									className="flex items-center justify-baseline mx-5 cursor-pointer hover:bg-zinc-300 rounded-md"
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
								</div>
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

				{pdf_file && !files && (
					<div className="flex flex-col bg-gradient-to-l from-zinc-50 to-zinc-100 items-center justify-center p-4 rounded-lg w-[95%] md:w-[80%] mb-10">
						<h4 className="font-medium text-2xl text-zinc-800 text-center m-5">
							Download your PDF files
						</h4>
						<div className="my-4 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-100 via-white to-zinc-200 rounded-lg border border-zinc-200">
							<div className="w-full mx-5 flex flex-row justify-between align-center border border-zinc-300 rounded-lg p-3 text-center text-zinc-800 bg-gradient-to-r from-zinc-400 to-zinc-200">
								<div
									className="font-semibold w-full flex flex-row align-baseline items-center truncate mx-1 md:mx-7"
									title={`wordify-pdf.pdf`}
								>
									<div className="hidden md:flex">
										<File className="mx-1 size-5" />
									</div>
									<p className="text-xs md:text-sm truncate w-full md:w-max p-2">
										{`wordify-pdf.pdf`}
									</p>
								</div>

								<div className="hidden md:container md:mx-7 md:flex md:items-center md:justify-center">
									<p className="border border-blue-300 text-teal-300 text-xs p-2 rounded-md">
										READY
									</p>
								</div>

								<div className="text-sm font-medium flex flex-row">
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

								<Button
									variant={"default"}
									title="Download file"
									onClick={() => downloadSingleFile(pdf_file)}
									className="py-5"
								>
									<Download />
								</Button>
							</div>

							<div className="container p-2 rounded-lg border border-zinc-300 flex flex-row items-center justify-between w-full my-2">
								<Button
									variant={"default"}
									className={
										"[&>*:last-child]:hover:translate-y-1 [&>*:last-child]:ease-in-out [&>*:last-child]:duration-200 my-2"
									}
									onClick={downloadAllFiles}
									title={"Download PDF"}
								>
									Download all
									<Download className="mx-1 size-6" />
								</Button>
							</div>
						</div>
					</div>
				)}
			</section>
		</>
	);
}
