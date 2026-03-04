import React from "react";
import { Label } from "../ui/label";
import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export default function SelectField({
  name,
  label,
  placeholder,
  options,
  control,
  error,
  // required = false,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-400">
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        // rules={{
        //   required: required ? `Please select ${label.toLowerCase()}` : false,
        // }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full !h-12 px-3 py-3 text-base border-gray-600 bg-gray-800 text-white rounded-lg focus:!border-yellow-500 focus:ring-0">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 text-white">
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="focus:bg-gray-600 focus:text-white"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
            {error && <p className="text-red-500 text-sm">{error.message}</p>}
          </Select>
        )}
      />
    </div>
  );
}
