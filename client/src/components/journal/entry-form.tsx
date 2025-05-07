import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Upload, X } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const entryFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  isPublic: z.boolean().default(false),
  mood: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
});

type EntryFormValues = z.infer<typeof entryFormSchema>;

interface EntryFormProps {
  defaultValues?: Partial<EntryFormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
  isEdit?: boolean;
  entryId?: number;
}

export function EntryForm({
  defaultValues = {
    title: "",
    content: "",
    isPublic: false,
    mood: undefined,
    imageUrl: null,
  },
  onSuccess,
  onCancel,
  isEdit = false,
  entryId,
}: EntryFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    defaultValues.imageUrl || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues,
  });

  const isPublic = watch("isPublic");

  // Upload image - in a real app this would upload to a storage service
  // For simplicity we're using URLs only
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPG, PNG and WebP images are supported",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setValue("imageUrl", event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setValue("imageUrl", null);
  };

  const createEntryMutation = useMutation({
    mutationFn: async (data: EntryFormValues) => {
      const response = await apiRequest("POST", "/api/entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Entry created",
        description: "Your journal entry has been saved",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/");
      }
    },
    onError: (error) => {
      toast({
        title: "Error creating entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async (data: EntryFormValues) => {
      const response = await apiRequest("PUT", `/api/entries/${entryId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}`] });
      toast({
        title: "Entry updated",
        description: "Your journal entry has been updated",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/entries/${entryId}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error updating entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: EntryFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save journal entries",
        variant: "destructive",
      });
      return;
    }

    if (isEdit && entryId) {
      updateEntryMutation.mutate(values);
    } else {
      createEntryMutation.mutate(values);
    }
  };

  const isPending =
    createEntryMutation.isPending || updateEntryMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-6">
        <Label htmlFor="entry-title" className="block text-sm font-medium mb-1">
          Title
        </Label>
        <Input
          id="entry-title"
          className="w-full px-4 py-2"
          {...register("title")}
          maxLength={150}
        />
        {errors.title && (
          <p className="text-destructive text-sm mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="mb-6">
        <Label
          htmlFor="entry-content"
          className="block text-sm font-medium mb-1"
        >
          Journal Entry
        </Label>
        <Textarea
          id="entry-content"
          rows={12}
          maxLength={4000}
          className="w-full px-4 py-2"
          placeholder="What's on your mind today?"
          {...register("content")}
        />
        {errors.content && (
          <p className="text-destructive text-sm mt-1">
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label className="block text-sm font-medium mb-1">
            Add Image (Optional)
          </Label>
          {imagePreview ? (
            <div className="relative mt-2 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full opacity-90"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-4 text-center cursor-pointer"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-neutral-400 dark:text-neutral-600" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Drag an image here or{" "}
                  <span className="text-primary-400">browse</span>
                </p>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <Label className="block text-sm font-medium mb-1">
            Privacy Settings
          </Label>
          <RadioGroup
            defaultValue={isPublic ? "public" : "private"}
            className="space-y-3"
            onValueChange={(value) => setValue("isPublic", value === "public")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private-entry" />
              <Label htmlFor="private-entry" className="cursor-pointer">
                Private (Only visible to me)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public-entry" />
              <Label htmlFor="public-entry" className="cursor-pointer">
                Public (Visible in public journal space)
              </Label>
            </div>
          </RadioGroup>

          <div className="mt-4">
            <Label className="block text-sm font-medium mb-1">
              Mood (Optional)
            </Label>
            <select
              className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
              {...register("mood")}
            >
              <option value="">Select a mood</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
              <option value="excited">Excited</option>
              <option value="calm">Calm</option>
              <option value="nervous">Nervous</option>
              <option value="stressed">Stressed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <i className="fas fa-robot text-accent-400 mr-1"></i> AI will analyze
          your entry for emotional insights
        </div>
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => navigate("/"))}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary-400 hover:bg-primary-500 text-white"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>{isEdit ? "Update Entry" : "Save Entry"}</>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
