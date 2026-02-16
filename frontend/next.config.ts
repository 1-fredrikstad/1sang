/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	outputFileTracingRoot: __dirname,
	/* config options here */
	experimental: {
		turbopack: true,
	},
	turbopack: {
		root: __dirname,
	}
} as any;

export default nextConfig;
