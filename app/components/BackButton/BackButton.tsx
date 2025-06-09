/**
 * BackButton Component
 * 
 * Supports three back navigation behaviors (in priority order):
 * 1. Explicit `backTo` prop - direct navigation to specified route
 * 2. Route mapping - uses ROUTE_BACK_MAPPING for consistent app-wide behavior
 *    - Example: /application/decks/123 → /application/history
 *    - Additional context: https://linear.app/gator/issue/PROD-1138/create-fix-for-back-arrow-navigation-issue-in-prod-1137
 * 3. Default - falls back to browser's back() function
 * 
 * Path normalization: Replaces numeric segments with `:id` for pattern matching
 * Example: /application/decks/123 → /application/decks/:id
 */
"use client";

import { useRouter, usePathname } from "next/navigation";

import { ArrowLeftIcon } from "../Icons/ArrowLeftIcon";

type BackButtonProps = {
  text?: string;
  backTo?: string; // Custom back destination
};

// Override back logic for specific routes
// Imagine a user visiting pages in the following order:
// A -> B -> C -> B
// When the user clicks the back button, we sometimes want to navigate to A, not C.
// But because this may not be the case for all routes, we need to be able to override the default back behavior.
const ROUTE_BACK_MAPPING: Record<string, string> = {
  '/application/decks/:id': '/application/history',
  // Add more route mappings as needed
  // '/some/route/:id': '/target/route',
};

// Function to normalize path by replacing numbers with :id
const normalizePath = (pathname: string): string => {
  return pathname.replace(/\/\d+/g, '/:id');
};

const BackButton = ({ text, backTo }: BackButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    router.refresh();
    
    // Priority: explicit backTo prop > route mapping > default back behavior
    if (backTo) {
      router.push(backTo);
    } else {
      const normalizedPath = normalizePath(pathname);
      const mappedDestination = ROUTE_BACK_MAPPING[normalizedPath];
      if (mappedDestination) {
        router.push(mappedDestination);
      } else {
        router.back();
      }
    }
  };

  return (
    <div className="cursor-pointer flex gap-5" onClick={handleBack}>
      <ArrowLeftIcon /> {text && <span>{text}</span>}
    </div>
  );
};

export default BackButton;
