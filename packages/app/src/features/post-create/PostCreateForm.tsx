import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button, CARDS, LoadingSpinner, Text, Textarea } from "@vittles/ui";
import { ChevronLeft, ChevronRight, Film, Image as ImageIcon, X } from "@vittles/ui";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FlatList, Platform, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import * as v from "valibot";
import { calculatePreviewImageSize } from "../../utils/image";
import { error, idle, loading } from "../../utils/trpc/pattern";
import { trpc } from "../../utils/trpc/trpc";
import type { ListRenderItem } from "react-native";

type Attachment = {
	key: string;
	ext: string;
};

type PostSchema = v.InferInput<typeof CreatePostSchema>;

type SelectedImage = v.InferInput<typeof ImagePickerAssetSchema>;

const ImagePickerAssetSchema = v.object({
	uri: v.string(),
	fileName: v.pipe(v.string(), v.regex(/\.(jpeg|png|gif|webp|bmp)$/i)),
	width: v.pipe(v.number(), v.minValue(100), v.maxValue(5000)),
	height: v.pipe(v.number(), v.minValue(100), v.maxValue(5000)),
});

const CreatePostSchema = v.pipe(
	v.object({
		content: v.string(),
		files: v.array(ImagePickerAssetSchema),
	}),
	v.forward(
		v.partialCheck(
			[["content"], ["files"]],
			(input) => {
				return !!input.content || input.files.length > 0;
			},
			"Post must contain either content or files.",
		),
		["content"],
	),
);

type PostProps = {
	rootPostId?: number;
	replyToPostId?: number;
	submitButtonText?: string;
	placeHolderText?: string;
};

export const NewPost = ({
	rootPostId = null,
	replyToPostId = null,
	submitButtonText = "Send",
	placeHolderText = "Content",
}: PostProps) => {
	const { width: screenWidth } = useWindowDimensions();

	// Set the container width to be the minimum of CARDS.MAIN.maxWidth or the screen width minus some margin on each side.
	const containerWidth = Math.min(CARDS.MAIN.maxWidth - CARDS.MAIN.marginX * 2, screenWidth - CARDS.MAIN.marginX * 2);

	const router = useRouter();
	const flatListRef = useRef(null);
	const [isScrolledEnd, setIsScrolledEnd] = useState(false);
	const create = trpc.post.createPost.useMutation({
		onSuccess: (data) => {
			form.reset();
			// router.push(`/post/${data.postId}`);
			create.reset();
		},
	});

	const {
		control,
		handleSubmit,
		setValue,
		setError,
		clearErrors,
		watch,
		formState: { errors, isSubmitting },
		...form
	} = useForm<PostSchema>({
		defaultValues: {
			content: "",
			files: [],
		},
		resolver: valibotResolver(CreatePostSchema),
	});

	const contentField = watch("content");
	const filesField = watch("files");

	const presignedUrls = trpc.file.getPresignedUrls.useQuery(
		{
			count: filesField.length,
		},
		{
			enabled: filesField.length > 0,
		},
	);

	const onSubmit = async ({ content }: PostSchema) => {
		if (create.isLoading || isSubmitting) return;

		const attachments: Attachment[] = [];

		if (filesField.length > 0 && presignedUrls.data) {
			await Promise.all(
				filesField.map(async (file, i) => {
					const data = presignedUrls.data[i];

					if (data) {
						const ext = file.fileName.split(".").pop() as string;
						const img = await fetchMediaFromUri(file.uri);

						attachments.push({
							key: data.key,
							ext,
						});

						// Upload images to R2 using presigned URL.
						await fetch(data.url, {
							method: "PUT",
							body: img,
						});
					}
				}),
			);
		}

		create.mutate({
			content: content.length > 0 ? content : null,
			files: attachments,
			rootPostId: rootPostId,
			replyToPostId: replyToPostId,
		});
	};

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true,
			selectionLimit: 4,
			aspect: [1, 1],
			quality: 1,
		});

		if (result.canceled) return;

		try {
			const images = v.parse(v.array(ImagePickerAssetSchema), result.assets);
			if (images.length > 4) {
				return setError("files", {
					type: "manual",
					message: "You can only select up to 4 files.",
				});
			}

			clearErrors(["files", "content"]);
			setValue("files", images);
		} catch (e) {
			setError("files", {
				type: "manual",
				message: "Invalid file format. Please select a JPEG, PNG, GIF, WEBP, or BMP file.",
			});
		}
	};

	const scrollToIndex = (index: number) => {
		// Scroll the image preview list to the selected index.
		flatListRef.current?.scrollToIndex({ index, animated: true });
	};

	const handleScroll = (event) => {
		// Check if image preview list is scrolled to the end.
		const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
		const isEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 10;
		setIsScrolledEnd(isEnd);
	};

	const keyExtractor = useCallback((item: SelectedImage, index) => {
		return `${item.uri.toString()}-${index}`;
	}, []);

	const removeMedia = (index: number) => {
		const newFiles = filesField.filter((_, i) => i !== index);
		setValue("files", newFiles);
	};

	const scrollToListEndButton = filesField.length > 2 && (
		<Button
			onPress={() => scrollToIndex(filesField.length - 1)}
			className="absolute right-2 top-1/2 rounded-full -translate-y-5 opacity-80"
			size="icon"
			variant="outline"
		>
			<ChevronRight size={Platform.OS === "web" ? 22 : 18} className="text-accent-foreground" />
		</Button>
	);

	const scrollToListStartButton = filesField.length > 2 && (
		<Button
			onPress={() => scrollToIndex(0)}
			className="absolute left-2 top-1/2 rounded-full -translate-y-5 opacity-80"
			size="icon"
			variant="outline"
		>
			<ChevronLeft size={Platform.OS === "web" ? 22 : 18} className="text-accent-foreground" />
		</Button>
	);

	const renderImage = ({ item, index }: { item: (typeof filesField)[number]; index: number }) => {
		const { width, height } = calculatePreviewImageSize({
			imageWidth: item.width,
			imageHeight: item.height,
			numFiles: filesField.length,
			containerWidth,
		});

		return (
			<View className="flex-1">
				<Image
					source={{ uri: item.uri }}
					style={{
						width,
						height,
						borderRadius: 10,
						marginLeft: index === 0 ? 0 : CARDS.MAIN.imageSpacing,
					}}
					contentFit="cover"
				/>
				<Button
					onPress={() => removeMedia(index)}
					className="absolute right-2 top-2 rounded-full opacity-80"
					variant="outline"
					size="icon"
				>
					<X size={Platform.OS === "web" ? 22 : 18} className="text-accent-foreground" />
				</Button>
			</View>
		);
	};

	const imagePreviewList = (
		<View className="flex flex-col items-center justify-center">
			<FlatList
				style={{ width: containerWidth }}
				onScroll={handleScroll}
				ref={flatListRef}
				horizontal={true}
				data={filesField}
				initialNumToRender={2}
				showsHorizontalScrollIndicator={false}
				keyExtractor={keyExtractor}
				renderItem={renderImage}
				scrollEventThrottle={16}
			/>
			{filesField.length > 2 && !isScrolledEnd && scrollToListEndButton}
			{filesField.length > 2 && isScrolledEnd && scrollToListStartButton}
		</View>
	);

	const formView = (
		<View className="flex flex-col">
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<Textarea
						onBlur={onBlur}
						onChangeText={(value) => onChange(value)}
						value={value}
						placeholder={placeHolderText}
						className="border-0 p-0 web:ring-0 web:ring-offset-0 placeholder:text-muted-foreground web:focus-visible:outline-none web:focus-visible:ring-0 web:focus-visible:ring-offset-0"
						numberOfLines={2}
					/>
				)}
				name="content"
				rules={{ required: true }}
			/>
			{errors.content && <Text className="text-red-500 text-sm">{errors.content.message}</Text>}
		</View>
	);

	const postControls = (
		<View className="flex flex-row justify-between">
			<View className="flex flex-row">
				<Button variant="ghost" size="icon" onPress={pickImage} className="">
					<ImageIcon size={Platform.OS === "web" ? 25 : 18} className="text-accent-foreground" />
				</Button>
				<Button variant="ghost" size="icon" onPress={pickImage} className="">
					<Film size={Platform.OS === "web" ? 25 : 18} className="text-accent-foreground" />
				</Button>
			</View>
			<Button
				variant="default"
				onPress={handleSubmit(onSubmit)}
				disabled={!(filesField.length > 0 || contentField.length > 0)}
			>
				<Text>{submitButtonText}</Text>
			</Button>
		</View>
	);

	const fileErrors = errors.files && <Text className="text-red-500 text-sm text-center">{errors.files.message}</Text>;

	// TODO: Refine the layout.
	const layout = match(create)
		.with(error, () => <Text>{create.error?.message || "Internal server error."}</Text>)
		.with(loading, () => <LoadingSpinner />)
		.with(idle, () => (
			<View className="flex flex-col gap-2">
				{formView}
				{fileErrors}
				{filesField.length > 0 && imagePreviewList}
				{postControls}
			</View>
		))
		.otherwise(() => <LoadingSpinner />);

	return <SafeAreaView className="flex-1">{layout}</SafeAreaView>;
};

const fetchMediaFromUri = async (uri: string) => {
	const response = await fetch(uri);
	const blob = await response.blob();
	return blob;
};
