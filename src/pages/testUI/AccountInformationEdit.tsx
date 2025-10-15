import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Globe} from "phosphor-react";
import { Button } from "@/components/ui/button";

export default function AccountInformationEdit() {
  return (
    <Card className="w-full bg-white max-w-4xl mx-auto shadow-sm border-none mb-0">
      <CardContent className="py-3 px-6 space-y-0">
        
        <div className="border-b border-gray-200">
          <h2 className="text-base font-semibold text-[#0F0901]">Account information</h2>
          <p className="text-xs text-[#A7A7A7]">
            Complete account overview and profile details
          </p>
        </div>

        
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <Label className="text-[11px] text-[#A7A7A7]">Account Id</Label>
            <Input placeholder="ACC-001" className=" bg-[#F3F3F3] placeholder:text-black h-8 text-xs border-[#E6E6E6] font-medium focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0" />
          </div>
          <div className="col-span-2">
            <Label className="text-[11px] text-[#A7A7A7]">Client Name</Label>
            <Input
              placeholder="Los Angeles County Metropolitan Transportation Authority (Metro)"
              className="bg-[#F3F3F3] h-8 text-xs border-[#E6E6E6] placeholder:text-black  font-medium focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0"
            />
          </div>
        </div>

        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] text-[#A7A7A7]">Client Type</Label>
            <Input placeholder="Tier 1" className="bg-[#F3F3F3] h-8 text-xs border-[#E6E6E6] placeholder:text-black  font-medium focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0" />
          </div>
          <div>
            <Label className="text-[11px] text-[#A7A7A7]">Market Sector</Label>
            <Input placeholder="Transportation" className="bg-[#F3F3F3] h-8 text-xs border-[#E6E6E6] placeholder:text-black  font-medium focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0" />
          </div>
        </div>

        
        <div>
          <Label className="text-[11px] text-[#A7A7A7]">Address</Label>
          <Input placeholder="Transportation" className="bg-[#F3F3F3] h-8 text-xs border-[#E6E6E6] placeholder:text-black font-medium focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0" />
        </div>

        
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <Label className="text-[11px] text-[#A7A7A7]">Website</Label>
            <div className="relative">
            <Globe size={16} className="absolute left-2 top-2 text-gray-700" />
            <Input placeholder="https://your-company.com" className="bg-[#F3F3F3] pl-7 h-8 text-xs text-blue-700 border-[#E6E6E6] placeholder:text-blue-700 font-normal focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0" />
            </div>
            
          </div>
          <div className="col-span-2">
            <Label className="text-[11px] text-[#A7A7A7]">Hosting Area</Label>
            <Input placeholder="West Coast Office" className="bg-[#F3F3F3] h-8 text-xs border-[#E6E6E6] placeholder:text-black font-medium focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0" />
          </div>
          <div className="col-span-1">
            <Label className="text-[11px] text-[#A7A7A7]">MSA In Place</Label>
            <Input placeholder="Yes" className=" h-8 text-xs text-[#FF8500] placeholder:text-[#FF8500] bg-[#ED8A0933] border-[#E6E6E6] font-medium focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0" />
          </div>
        </div>

        
        <div className="grid grid-cols-2 gap-3">
          <div >
            <Label className="text-[11px] text-[#A7A7A7]">Account Approver</Label>
            <Input placeholder="David Rodriguez - Senior Partner" className="bg-[#F3F3F3] h-8 text-xs border-[#E6E6E6] placeholder:text-black font-medium focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0" />
          </div>
          <div>
            <Label className="text-[11px] text-[#A7A7A7]">Approval Date & Time</Label>
            <Input placeholder="December 15, 2024 at 2:30 PM PST" className="bg-[#F3F3F3] h-8 text-xs border-[#E6E6E6] placeholder:text-black font-medium focus:border-[#FF7B00] focus:outline-none focus:ring-0 focus-visible:ring-0" />
          </div>
        </div>
        
        
        <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-between">
            <Button variant="outline" className="px-6 py-2 text-sm order-2 sm:order-1">
                Cancel
            </Button>
            <Button className="px-6 py-2 text-sm bg-black text-white order-1 sm:order-2">
                Save Changes
            </Button>
         </div>
      </CardContent>
    </Card>
  );
}
