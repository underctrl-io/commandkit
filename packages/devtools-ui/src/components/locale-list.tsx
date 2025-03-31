import { useState } from "react"
import { Edit, Trash, MoreHorizontal, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for locales
const locales = [
  {
    id: "1",
    code: "en-US",
    name: "English (US)",
    default: true,
    completionPercentage: 100,
    translatedStrings: 245,
    totalStrings: 245,
  },
  {
    id: "2",
    code: "es-ES",
    name: "Spanish (Spain)",
    default: false,
    completionPercentage: 85,
    translatedStrings: 208,
    totalStrings: 245,
  },
  {
    id: "3",
    code: "fr-FR",
    name: "French (France)",
    default: false,
    completionPercentage: 72,
    translatedStrings: 176,
    totalStrings: 245,
  },
  {
    id: "4",
    code: "de-DE",
    name: "German (Germany)",
    default: false,
    completionPercentage: 68,
    translatedStrings: 167,
    totalStrings: 245,
  },
  {
    id: "5",
    code: "ja-JP",
    name: "Japanese (Japan)",
    default: false,
    completionPercentage: 45,
    translatedStrings: 110,
    totalStrings: 245,
  },
  {
    id: "6",
    code: "pt-BR",
    name: "Portuguese (Brazil)",
    default: false,
    completionPercentage: 62,
    translatedStrings: 152,
    totalStrings: 245,
  },
  {
    id: "7",
    code: "ru-RU",
    name: "Russian (Russia)",
    default: false,
    completionPercentage: 38,
    translatedStrings: 93,
    totalStrings: 245,
  },
]

export function LocaleList({ onEditTranslations }: { onEditTranslations: (locale: string) => void }) {
  const [selectedLocales, setSelectedLocales] = useState<string[]>([])

  const toggleLocale = (id: string) => {
    setSelectedLocales((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedLocales.length === locales.length) {
      setSelectedLocales([])
    } else {
      setSelectedLocales(locales.map((c) => c.id))
    }
  }

  return (
    <div>
      {selectedLocales.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">{selectedLocales.length} selected</span>
          <Button variant="outline" size="sm">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={locales.length > 0 && selectedLocales.length === locales.length}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Locale</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Completion</TableHead>
            <TableHead className="hidden md:table-cell">Translated</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locales.map((locale) => (
            <TableRow key={locale.id}>
              <TableCell>
                <Checkbox
                  checked={selectedLocales.includes(locale.id)}
                  onCheckedChange={() => toggleLocale(locale.id)}
                  aria-label={`Select ${locale.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{locale.name}</div>
                    <div className="text-xs text-muted-foreground">{locale.code}</div>
                  </div>
                  {locale.default && (
                    <Badge variant="outline" className="ml-2">
                      Default
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant={locale.completionPercentage === 100 ? "default" : "outline"}>
                  {locale.completionPercentage === 100 ? "Complete" : "In Progress"}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <Progress value={locale.completionPercentage} className="h-2 w-[100px]" />
                  <span className="text-xs text-muted-foreground">{locale.completionPercentage}%</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="text-sm">
                  {locale.translatedStrings} / {locale.totalStrings}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditTranslations(locale.code)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Translations
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {!locale.default && <DropdownMenuItem>Set as Default</DropdownMenuItem>}
                    <DropdownMenuItem>Export</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

