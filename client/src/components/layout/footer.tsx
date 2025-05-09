import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-6 px-6 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center">
          Designed with <Heart className="h-4 w-4 mx-1 text-red-500" /> by
          Carson Liu
        </span>
      </div>
    </footer>
  );
}
