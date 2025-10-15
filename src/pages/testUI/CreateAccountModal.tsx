import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkle,Plus,Globe } from "phosphor-react";

export default function CreateAccountModal() {
  return (
    <Dialog>
      
      <DialogTrigger asChild>
        <Button className="bg-[#0F0901] text-white rounded-2xl">
          <Plus size={16} /> Create Account
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl bg-white !rounded-3xl p-8">
        <DialogHeader className="border-b border-gray-300 pb-6">
          <DialogTitle className="text-2xl font-semibold text-[#ED8A09] ">
            Create New Account
          </DialogTitle>
          <DialogDescription className=" text-gray-500">
            Add a new client account to your portfolio
          </DialogDescription>
        </DialogHeader>

        
        <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
             <Sparkle className="bg-[#EEEEEE] text-orange-400 rounded-full p-2 size-8"/>
             <Label className="text-xl">Company Website (AI Smart Population)</Label>
            </div>
          
          <div className="relative mt-2 ">
            <Globe size={20} className="absolute left-2 top-2 text-gray-800" />
            <Input
              type="url"
              placeholder="https://your-company.com"
              className="pl-8 rounded-xl text-[#2277F6] bg-[#F3F3F3] focus:bg-white border-[#E6E6E6] focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0"
            />
          </div>
        </div>

        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Client Name *</Label>
            <Input placeholder="Company Name" className="rounded-xl mt-2 border-[#E6E6E6] text-bold bg-[#F3F3F3] placeholder:text-[#A7A7A7]  focus:border-[#FF7B00] focus:bg-white focus:text-black focus:outline-none focus:ring-0 focus-visible:ring-0" />
          </div>
          <div>
            <Label>Client Address</Label>
            <Input placeholder="Billing address (auto-fill by AI)" className="rounded-xl mt-2 border-[#E6E6E6] text-bold bg-[#F3F3F3] placeholder:text-[#A7A7A7]  focus:border-[#FF7B00] focus:bg-white focus:text-black focus:outline-none focus:ring-0 focus-visible:ring-0" />
          </div>

          <div>
            <Label>Primary Contact</Label>
            <Input placeholder="Contact Name" className="rounded-xl mt-2 border-[#E6E6E6] text-bold bg-[#F3F3F3] placeholder:text-[#A7A7A7]  focus:border-[#FF7B00] focus:bg-white focus:text-black focus:outline-none focus:ring-0 focus-visible:ring-0" />
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input placeholder="Email address" type="email" className="rounded-xl mt-2 border-[#E6E6E6] text-bold bg-[#F3F3F3] placeholder:text-[#A7A7A7]  focus:border-[#FF7B00] focus:bg-white focus:text-black focus:outline-none focus:ring-0 focus-visible:ring-0" />
          </div>

          <div>
            <Label>Client Market Sector *</Label>
            <Select>
              <SelectTrigger className="mt-2 rounded-xl text-bold bg-[#F3F3F3] border-[#E6E6E6] focus:bg-white focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
            </Select>
          </div>
          <div>
            <Label>Client Type *</Label>
            <Select>
              <SelectTrigger className="mt-2 rounded-xl text-bold bg-[#F3F3F3] border-[#E6E6E6] focus:bg-white focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
            </Select>
          </div>

          <div>
            <Label>Hosting Area/Office</Label>
            <Select>
              <SelectTrigger className="mt-2 rounded-xl text-bold bg-[#F3F3F3] border-[#E6E6E6] focus:bg-white focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0">
                <SelectValue placeholder="Select office" />
              </SelectTrigger>
            </Select>
          </div>
          <div>
            <Label>MSA In Place</Label>
            <Select>
              <SelectTrigger className="mt-2 rounded-xl text-bold bg-[#F3F3F3] border-[#E6E6E6] focus:bg-white focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
            </Select>
          </div>
        </div>

        
         <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-between">
            <Button variant="outline" className="px-6 py-2 text-sm order-2 sm:order-1">
                Cancel
            </Button>
            <Button className="px-6 py-2 text-sm bg-black text-white order-1 sm:order-2">
                Create Account
            </Button>
         </div>
      </DialogContent>
    </Dialog>
  );
}
