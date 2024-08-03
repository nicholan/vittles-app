import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Pressable } from "react-native";

type ButtonProps = {
	className?: string;
} & ComponentPropsWithoutRef<"button">;

export function Button({ className, ...props }: ButtonProps) {
	return (
		<Pressable className={clsx(["p2 outline-stone-700"], ["text-black"], ["dark:text-white"], className)}>
			{props.children}
		</Pressable>
	);
}
