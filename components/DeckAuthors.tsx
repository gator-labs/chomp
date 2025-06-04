import { Avatar } from "@/app/components/Avatar/Avatar";
import { Button } from "@/app/components/ui/button";
import { QuestionAuthor } from "@/app/types/question-author";
import { cn } from "@/lib/utils";

type DeckAuthorsProps = {
    // Authors of individuals questions submitted via ask feature
  questionAuthors: QuestionAuthor[] | undefined;
  // Deck info author is the author of the deck, defined in deck info
  deckInfoAuthor?: string | null;
  deckInfoAuthorImageUrl?: string | null;
};

function DeckAuthors({
  questionAuthors,
  deckInfoAuthor,
  deckInfoAuthorImageUrl,
}: DeckAuthorsProps) {
    console.log(questionAuthors);

    // Helper function to truncate address to "first3..last3" format
    const truncateAddress = (address: string): string => {
        if (address.length <= 8) return address; // Don't truncate if too short
        return `${address.slice(0, 3)}..${address.slice(-3)}`;
    };

    // Helper function to truncate author names to 20 characters
    const truncateName = (name: string): string => {
        if (name.length <= 20) return name;
        return `${name.slice(0, 20)}...`;
    };

    // Use questionAuthors if they exist and have content, otherwise fall back to deckInfoAuthor
    const useQuestionAuthors = questionAuthors && questionAuthors.length > 0;
    
    if (!useQuestionAuthors && !deckInfoAuthor) {
        return null;
    }

    let authorNames: string;
    let authorImages: string[] = [];

    if (useQuestionAuthors) {
        // Use question authors
        const count = questionAuthors!.length;
        if (count === 1) {
            const author = questionAuthors![0];
            const displayName = author.username 
                ? truncateName(author.username) 
                : truncateAddress(author.address);
            authorNames = `By ${displayName}`;
        } else if (count > 5) {
            authorNames = `5+ Authors`;
        } else {
            authorNames = `${count} Authors`;
        }
        
        // Collect avatar URLs from question authors (limit to first 5)
        authorImages = questionAuthors!
            .slice(0, 5) // Take only first 5 authors
            .map(author => author.avatarUrl)
            .filter((url): url is string => !!url);
    } else {
        // Use deck info author
        authorNames = `By ${truncateName(deckInfoAuthor!)}`;
        if (deckInfoAuthorImageUrl) {
            authorImages = [deckInfoAuthorImageUrl];
        }
    }

    return (
        <div className="flex gap-2 items-center">
            {/* Display images with overlapping if multiple */}
            {authorImages.length > 0 && (
                <div className="flex">
                    {authorImages.map((imageUrl, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative",
                                index > 0 && "-ml-3" // Overlap previous image
                            )}
                            style={{ zIndex: index + 1 }} // Rightmost on top (higher index = higher z-index)
                        >
                            <Avatar
                                src={imageUrl}
                                size="small"
                                className="w-9 h-9 border-2 border-white"
                            />
                        </div>
                    ))}
                </div>
            )}

            <p className="text-[12px] font-bold leading-[16.5px]">
                {authorNames}
            </p>
        </div>
    )
}

export default DeckAuthors;
