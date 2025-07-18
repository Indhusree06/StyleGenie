"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Save, Trash2 } from "lucide-react"

interface EditWardrobeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editFormData: any
  setEditFormData: (data: any) => void
  availableTags: any[]
  imagePreview: string | null
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: () => void
}

export default function EditWardrobeModal({
  isOpen,
  onClose,
  onSave,
  editFormData,
  setEditFormData,
  availableTags,
  imagePreview,
  onImageChange,
  onRemoveImage,
}: EditWardrobeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <CardHeader className="bg-gray-700/50 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-teal-400" />
              Edit Wardrobe Item
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div>
            <Label className="text-sm font-semibold text-gray-300">Item Image</Label>
            <div className="mt-3">
              {imagePreview ? (
                <div className="relative w-48 h-64 mx-auto">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl border-2 border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={onRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center bg-gray-700/30">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Upload a new image</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image-upload")?.click()}
                    className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                  >
                    Choose Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-300">
                Item Name *
              </Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="mt-2 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="edit-brand" className="text-sm font-semibold text-gray-300">
                Brand
              </Label>
              <Input
                id="edit-brand"
                value={editFormData.brand}
                onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                className="mt-2 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="edit-color" className="text-sm font-semibold text-gray-300">
                Color
              </Label>
              <Input
                id="edit-color"
                value={editFormData.color}
                onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                className="mt-2 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="edit-size" className="text-sm font-semibold text-gray-300">
                Size
              </Label>
              <Input
                id="edit-size"
                value={editFormData.size}
                onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                className="mt-2 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="edit-price" className="text-sm font-semibold text-gray-300">
                Price ($)
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                className="mt-2 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="edit-condition" className="text-sm font-semibold text-gray-300">
                Condition
              </Label>
              <Select
                value={editFormData.condition}
                onValueChange={(value) => setEditFormData({ ...editFormData, condition: value })}
              >
                <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  <SelectItem value="new">New (with tags)</SelectItem>
                  <SelectItem value="excellent">Excellent (like new)</SelectItem>
                  <SelectItem value="good">Good (minor wear)</SelectItem>
                  <SelectItem value="fair">Fair (noticeable wear)</SelectItem>
                  <SelectItem value="poor">Poor (significant wear)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-300">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              rows={3}
              className="mt-2 bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Wear Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-wear-count" className="text-sm font-semibold text-gray-300">
                Times Worn
              </Label>
              <Input
                id="edit-wear-count"
                type="number"
                min="0"
                value={editFormData.wearCount}
                onChange={(e) => setEditFormData({ ...editFormData, wearCount: e.target.value })}
                className="mt-2 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="edit-last-worn" className="text-sm font-semibold text-gray-300">
                Last Worn Date
              </Label>
              <Input
                id="edit-last-worn"
                type="date"
                value={editFormData.lastWorn}
                onChange={(e) => setEditFormData({ ...editFormData, lastWorn: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="mt-2 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-semibold text-gray-300">Tags</Label>
            <div className="mt-3 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                {availableTags.map((tag) => (
                  <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.selectedTags.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditFormData({
                            ...editFormData,
                            selectedTags: [...editFormData.selectedTags, tag.id]
                          })
                        } else {
                          setEditFormData({
                            ...editFormData,
                            selectedTags: editFormData.selectedTags.filter((id: string) => id !== tag.id)
                          })
                        }
                      }}
                      className="rounded border-gray-500 text-teal-500 focus:ring-teal-400"
                    />
                    <Badge
                      className="text-xs border-0"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  </label>
                ))}
              </div>

              {editFormData.selectedTags.length > 0 && (
                <div className="flex gap-2 flex-wrap p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                  <span className="text-sm text-gray-300">Selected:</span>
                  {editFormData.selectedTags.map((tagId: string) => {
                    const tag = availableTags.find((t) => t.id === tagId)
                    return tag ? (
                      <Badge
                        key={tag.id}
                        className="text-xs border-0"
                        style={{ backgroundColor: `${tag.color}30`, color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-600">
            <Button
              onClick={onSave}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="px-8 border-gray-600 hover:bg-gray-700 bg-transparent text-white"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}