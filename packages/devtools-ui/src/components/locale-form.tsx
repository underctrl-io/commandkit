"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  code: z.string().min(1, "Locale code is required"),
  name: z.string().min(1, "Locale name is required"),
  default: z.boolean().default(false),
})

export function LocaleForm({ onCancel }: { onCancel: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      default: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // Here you would typically send the data to your API
    onCancel()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Locale Code</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a locale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">en-US (English, United States)</SelectItem>
                      <SelectItem value="es-ES">es-ES (Spanish, Spain)</SelectItem>
                      <SelectItem value="fr-FR">fr-FR (French, France)</SelectItem>
                      <SelectItem value="de-DE">de-DE (German, Germany)</SelectItem>
                      <SelectItem value="ja-JP">ja-JP (Japanese, Japan)</SelectItem>
                      <SelectItem value="pt-BR">pt-BR (Portuguese, Brazil)</SelectItem>
                      <SelectItem value="ru-RU">ru-RU (Russian, Russia)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>The locale code in the format language-COUNTRY.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="English (US)" {...field} />
                </FormControl>
                <FormDescription>The human-readable name of the locale.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Default Locale</FormLabel>
                <FormDescription>Set this locale as the default for your bot.</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Locale</Button>
        </div>
      </form>
    </Form>
  )
}

