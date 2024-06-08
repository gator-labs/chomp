"use client";
import AvatarPlaceholder from "@chomp/public/images/avatar_placeholder.png";
import { createContext, useContext, useMemo } from "react";

interface MetadataContextState {
  avatarSrc: string;
}

const initialContextValue = {
  avatarSrc: AvatarPlaceholder.src,
};

export const MetadataContext =
  createContext<MetadataContextState>(initialContextValue);

const MetadataProvider = ({
  profileSrc,
  children,
}: Readonly<{
  profileSrc: string;
  children: React.ReactNode;
}>) => {
  const value = useMemo(
    () => ({ avatarSrc: profileSrc ?? AvatarPlaceholder.src }),
    [profileSrc],
  );

  return (
    <MetadataContext.Provider value={value}>
      {children}
    </MetadataContext.Provider>
  );
};

export default MetadataProvider;

export const useMetadata = (): MetadataContextState =>
  useContext(MetadataContext);
