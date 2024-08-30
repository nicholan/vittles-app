import { CARDS } from "@vittles/ui";

type ImageDimensions = {
	width: number;
	height: number;
};

type CalcProps = {
	containerWidth?: number;
	imageWidth: number;
	imageHeight: number;
	numFiles: number;
	margin?: number;
	spacing?: number;
};

export const calculatePreviewImageSize = ({
	imageHeight,
	imageWidth,
	numFiles,
	containerWidth = CARDS.MAIN.maxWidth,
	margin = CARDS.MAIN.marginX,
	spacing = CARDS.MAIN.imageSpacing,
}: CalcProps): ImageDimensions => {
	let aspectRatio = 1; // Default for 1/1 aspect ratio for multiple images

	if (numFiles === 1) {
		// Determine aspect ratio based on orientation
		aspectRatio = imageWidth < imageHeight ? 3 / 4 : 4 / 3;
	}

	const width = numFiles === 1 ? containerWidth : (containerWidth - spacing) / 2;
	const height = width / aspectRatio;

	return { width, height };
};
