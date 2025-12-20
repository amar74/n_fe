import React, { useState, useEffect } from 'react';
import { useDataEnrichment, useProgressiveEnhancement } from '@/hooks/ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertCircle, CheckCircle, Zap } from 'lucide-react';

interface AccountFormData {
  companyWebsite: string;
  clientName: string;
  industry: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    title: string;
  };
}

interface AISuggestion {
  field: string;
  value: any;
  confidence: number;
  source: string;
  reasoning?: string;
  should_auto_apply: boolean;
}

export function AccountFormWithAI() {
  const [formData, setFormData] = useState<AccountFormData>({
    companyWebsite: '',
    clientName: '',
    industry: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    },
    primaryContact: {
      name: '',
      email: '',
      phone: '',
      title: ''
    }
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);

  const { 
    suggestOrganizationName, 
    enhanceAccountData, 
    isLoading, 
    error, 
    clearError 
  } = useDataEnrichment({
    autoApply: false, // Manual control
    confidenceThreshold: 0.8,
    onSuggestionReceived: (suggestion) => {
    },
    onError: (error) => {
    }
  });

  const { 
    enhanceWithContext, 
    getSuggestions, 
    clearSuggestions, 
    isEnhancing, 
    hasSuggestions 
  } = useProgressiveEnhancement();

  const handleWebsiteBlur = async () => {
    if (!formData.companyWebsite) return;

    clearError();
    
    try {
      const result = await enhanceWithContext(formData.companyWebsite, {
        client_name: formData.clientName,
        industry: formData.industry
      });

      const aiSuggestions = Object.entries(result.enhanced_data).map(([field, suggestion]) => ({
        field,
        value: suggestion.value,
        confidence: suggestion.confidence,
        source: suggestion.source,
        reasoning: suggestion.reasoning,
        should_auto_apply: suggestion.should_auto_apply
      }));

      setSuggestions(aiSuggestions);
      setShowSuggestions(true);

    } catch (err) {
    }
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    const { field, value } = suggestion;

    switch (field) {
      case 'company_name':
        setFormData(prev => ({ ...prev, clientName: value }));
        break;
      case 'industry':
        setFormData(prev => ({ ...prev, industry: value }));
        break;
      case 'primary_contact':
        if (typeof value === 'object') {
          setFormData(prev => ({
            ...prev,
            primaryContact: {
              ...prev.primaryContact,
              name: value.name || prev.primaryContact.name,
              email: value.email || prev.primaryContact.email,
              phone: value.phone || prev.primaryContact.phone,
              title: value.title || prev.primaryContact.title
            }
          }));
        }
        break;
      case 'address':
        if (typeof value === 'object') {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              line1: value.line1 || prev.address.line1,
              line2: value.line2 || prev.address.line2,
              city: value.city || prev.address.city,
              state: value.state || prev.address.state,
              pincode: value.pincode || prev.address.pincode
            }
          }));
        }
        break;
    }

    setAppliedSuggestions(prev => [...prev, field]);
  };

  const applyAllSuggestions = () => {
    suggestions
      .filter(s => s.confidence >= 0.8 && !appliedSuggestions.includes(s.field))
      .forEach(applySuggestion);
  };

  const clearAllSuggestions = () => {
    setSuggestions([]);
    setShowSuggestions(false);
    setAppliedSuggestions([]);
    clearSuggestions();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (confidence >= 0.7) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Create Account with AI Enhancement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              Company Website *
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://company.com"
              value={formData.companyWebsite}
              onChange={(e) => setFormData(prev => ({ ...prev, companyWebsite: e.target.value }))}
              onBlur={handleWebsiteBlur}
              className="w-full"
            />
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing website and extracting information...
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              placeholder="Enter company name"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry/Sector</Label>
            <Input
              id="industry"
              placeholder="e.g., Technology, Healthcare, Finance"
              value={formData.industry}
              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address1">Address Line 1 *</Label>
              <Input
                id="address1"
                placeholder="123 Main Street"
                value={formData.address.line1}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, line1: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address2">Address Line 2</Label>
              <Input
                id="address2"
                placeholder="Suite 100"
                value={formData.address.line2}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, line2: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="San Francisco"
                value={formData.address.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="CA"
                value={formData.address.state}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, state: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">ZIP Code *</Label>
              <Input
                id="pincode"
                placeholder="94105"
                value={formData.address.pincode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, pincode: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Primary Contact Name</Label>
              <Input
                id="contactName"
                placeholder="John Doe"
                value={formData.primaryContact.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  primaryContact: { ...prev.primaryContact, name: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email Address *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="john@company.com"
                value={formData.primaryContact.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  primaryContact: { ...prev.primaryContact, email: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number</Label>
              <Input
                id="contactPhone"
                placeholder="+1 (555) 123-4567"
                value={formData.primaryContact.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  primaryContact: { ...prev.primaryContact, phone: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactTitle">Job Title</Label>
              <Input
                id="contactTitle"
                placeholder="CEO, CTO, etc."
                value={formData.primaryContact.title}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  primaryContact: { ...prev.primaryContact, title: e.target.value }
                }))}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">AI Enhancement Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearError}
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Suggestions
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyAllSuggestions}
                      disabled={suggestions.filter(s => s.confidence >= 0.8 && !appliedSuggestions.includes(s.field)).length === 0}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Apply All High Confidence
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllSuggestions}
                    >
                      Clear
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        appliedSuggestions.includes(suggestion.field)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium capitalize">
                              {suggestion.field.replace('_', ' ')}
                            </span>
                            <Badge 
                              className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                            >
                              {getConfidenceIcon(suggestion.confidence)}
                              <span className="ml-1">
                                {(suggestion.confidence * 100).toFixed(0)}%
                              </span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.source}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-700 mb-2">
                            {typeof suggestion.value === 'object' ? (
                              <div className="space-y-1">
                                {Object.entries(suggestion.value).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              suggestion.value
                            )}
                          </div>
                          
                          {suggestion.reasoning && (
                            <p className="text-xs text-gray-600 italic">
                              {suggestion.reasoning}
                            </p>
                          )}
                        </div>
                        
                        <Button
                          variant={appliedSuggestions.includes(suggestion.field) ? "secondary" : "default"}
                          size="sm"
                          onClick={() => applySuggestion(suggestion)}
                          disabled={appliedSuggestions.includes(suggestion.field)}
                        >
                          {appliedSuggestions.includes(suggestion.field) ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Applied
                            </>
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setFormData({
              companyWebsite: '',
              clientName: '',
              industry: '',
              address: { line1: '', line2: '', city: '', state: '', pincode: '' },
              primaryContact: { name: '', email: '', phone: '', title: '' }
            })}>
              Reset Form
            </Button>
            <Button 
              onClick={() => {
                alert('Account created successfully! (Check console for data)');
              }}
              disabled={!formData.clientName || !formData.companyWebsite}
            >
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}