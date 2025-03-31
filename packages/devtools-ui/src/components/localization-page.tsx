"use client"

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LocaleList } from "@/components/locale-list"
import { LocaleForm } from "@/components/locale-form"
import { TranslationEditor } from "@/components/translation-editor"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function LocalizationPage() {
  const [showLocaleForm, setShowLocaleForm] = useState(false)
  const [showTranslationEditor, setShowTranslationEditor] = useState(false)
  const [selectedLocale, setSelectedLocale] = useState<string | null>(null)

  const handleEditTranslations = (locale: string) => {
    setSelectedLocale(locale)
    setShowTranslationEditor(true)
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Localization</h2>
          <p className="text-muted-foreground">Manage translations and locales for your bot.</p>
        </div>
        <Button onClick={() => setShowLocaleForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Locale
        </Button>
      </div>

      {showLocaleForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Add New Locale</CardTitle>
            <CardDescription>Add a new language for your bot to support.</CardDescription>
          </CardHeader>
          <CardContent>
            <LocaleForm onCancel={() => setShowLocaleForm(false)} />
          </CardContent>
        </Card>
      ) : showTranslationEditor && selectedLocale ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Edit Translations: {selectedLocale}</CardTitle>
              <CardDescription>Edit translations for the selected locale.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setShowTranslationEditor(false)}>
              Back to Locales
            </Button>
          </CardHeader>
          <CardContent>
            <TranslationEditor locale={selectedLocale} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Supported Locales</CardTitle>
              <CardDescription>Manage the languages your bot supports.</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export Translations</DropdownMenuItem>
                <DropdownMenuItem>Import Translations</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Search locales..."
                className="max-w-sm"
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>

            <LocaleList onEditTranslations={handleEditTranslations} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

