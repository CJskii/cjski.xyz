"use client";

import React from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: string[];
}

const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => (
        <Image
          key={index}
          className="h-8 w-8 rounded-full border-2 border-accent bg-background"
          src={url}
          width={40}
          height={40}
          alt={`Avatar ${index + 1}`}
        />
      ))}
      {numPeople === 0 ? null : (
        <Link
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent bg-primary text-primary-foreground text-center text-xs font-medium"
          href="/contracts"
        >
          +{numPeople}
        </Link>
      )}
    </div>
  );
};

export default AvatarCircles;
