"use client"

import { AlignCenter, AlignLeft, CalendarIcon, CheckSquare, ChevronDown, CircleDot, FileImage, GripVertical, Heading1, Heading2, Image, List, MessageSquare, Pencil, Plus, Quote, Save, ToggleLeftIcon, Trash2, Type, X } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../ui/dropdown-menu";
import React, { useState } from "react";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { CollapsibleTrigger } from "../ui/collapsible";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  type: string;
  title: string;
  content: string;
  options?: string[];
  required: boolean;
}

interface Screen {
  id: string
  title: string
  content: ContentItem[]
}

export const FlowBuilder: React.FC = () => {
  const [screens, setScreens] = useState<Screen[]>([
    { id: "First_Screen", title: "First Screen", content: [] },
  ]);
  const [date, setDate] = useState<Date | undefined>();
  const [selectedScreen, setSelectedScreen] = useState<string>("First_Screen");
  const currentScreen = screens.find((screen) => screen.id === selectedScreen);

  const updateScreenTitle = (screenId: string, newTitle: string) => {
    setScreens(screens.map((screen) => (screen.id === screenId ? { ...screen, title: newTitle } : screen)))
  }

  const addContent = (type: string) => {
    if (!currentScreen) return

    const newContent: ContentItem = {
      id: `content_${currentScreen.content.length + 1}`,
      type,
      title: "",
      content: "",
      required: false,
      ...(type === "single-choice" || type === "multiple-choice" || type === "dropdown" ? { options: ["Option 1"] } : {}),
    }

    setScreens(screens.map((screen) => screen.id === currentScreen.id ? { ...screen, content: [...screen.content, newContent] } : screen));
  }

  const updateContentOption = (contentId: string, optionIndex: number, newOption: string) => {
    if (!currentScreen) return

    setScreens(screens.map((screen) => {
      if (screen.id === currentScreen.id) {
        return {
          ...screen,
          content: screen.content.map((content) => {
            if (content.id === contentId) {
              const newOptions = content.options ? [...content.options] : [];
              newOptions[optionIndex] = newOption;
              return { ...content, options: newOptions };
            }
            return content;
          })
        };
      }
      return screen;
    }));
  }

  const addContentOption = (contentId: string) => {
    if (!currentScreen) return

    setScreens(screens.map((screen) => {
      if (screen.id === currentScreen.id) {
        return {
          ...screen,
          content: screen.content.map((content) => {
            if (content.id === contentId) {
              const newOptions = content.options ? [...content.options, `Option ${content.options.length + 1}`] : [];
              return { ...content, options: newOptions };
            }
            return content;
          })
        };
      }
      return screen;
    }));
  }

  const deleteContentOption = (contentId: string, optionIndex: number) => {
    if (!currentScreen) return

    setScreens(screens.map((screen) => {
      if (screen.id === currentScreen.id) {
        return {
          ...screen,
          content: screen.content.map((content) => {
            if (content.id === contentId) {
              const newOptions = content.options ? content.options.filter((_, index) => index !== optionIndex) : [];
              return { ...content, options: newOptions };
            }
            return content;
          })
        };
      }
      return screen;
    }));
  }

  const updateContent = (contentId: string, newContent: string) => {
    if (!currentScreen) return

    setScreens(screens.map((screen) => {
      if (screen.id === currentScreen.id) {
        return {
          ...screen,
          content: screen.content.map((content) => {
            if (content.id === contentId) {
              return { ...content, content: newContent };
            }
            return content;
          })
        };
      }
      return screen;
    }));
  }

  const updateContentTitle = (contentId: string, newTitle: string) => {
    if (!currentScreen) return

    setScreens(screens.map((screen) => {
      if (screen.id === currentScreen.id) {
        return {
          ...screen,
          content: screen.content.map((content) => {
            if (content.id === contentId) {
              return { ...content, title: newTitle };
            }
            return content;
          })
        };
      }
      return screen;
    }));
  }

  const deleteContent = (contentId: string) => {
    if (!currentScreen) return

    setScreens(screens.map((screen) => {
      if (screen.id === currentScreen.id) {
        return {
          ...screen,
          content: screen.content.filter((content) => content.id !== contentId)
        };
      }
      return screen;
    }));
  }

  const renderContentOptions = (content: ContentItem) => {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label>Label</Label>
          <Input value={content.title} onChange={(e) => updateContentTitle(content.id, e.target.value)} className="w-full" />
        </div>

        {(content.type === "single-choice" || content.type === "multiple-choice" || content.type === "dropdown") && (
          <div className="space-y-4">
            <Label>Options</Label>
            <div className="space-y-2">
              {content.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={option} onChange={(e) => updateContentOption(content.id, index, e.target.value)} className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => deleteContentOption(content.id, index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" size="sm" onClick={() => addContentOption(content.id)}>Add Option</Button>
              <div className="flex items-center gap-2">
                <Switch id={`required-${content.id}`} checked={content.required} onCheckedChange={(checked) => updateContentRequired(content.id, checked)} />
                <Label htmlFor={`required-${content.id}`} className="text-sm font-medium">Required</Label>
              </div>
            </div>
          </div>
        )}

        {(content.type === "opt-in" ||
          content.type === "short-answer" ||
          content.type === "paragraph" ||
          content.type === "date-picker") && (
            <div className="space-y-2">
              <div className="flex justify-end items-center gap-2">
                <Switch id={`required-${content.id}`} checked={content.required} onCheckedChange={(checked) => updateContentRequired(content.id, checked)} />
                <Label htmlFor={`required-${content.id}`} className="text-sm font-medium">Required</Label>
              </div>
            </div>
          )}
      </div>
    );
  };

  const updateContentRequired = (contentId: string, required: boolean) => {
    if (!currentScreen) return;

    setScreens(screens.map((screen) => {
      if (screen.id === currentScreen.id) {
        return {
          ...screen,
          content: screen.content.map((content) => {
            if (content.id === contentId) {
              return { ...content, required };
            }
            return content;
          })
        };
      }
      return screen;
    }));
  };

  const renderPreviewContent = (content: ContentItem) => {
    return (
      <div className="p-1">
        <h4 className="font-semibold mb-2">{content.title}</h4>
        {content.type === "single-choice" ? (
          <RadioGroup>
            {content.options?.map((option, index) => (
              <div key={index} className="flex items-center">
                <RadioGroupItem id={`option-${index}`} value={option} />
                <Label htmlFor={`option-${index}`} className="ml-2">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : content.type === "multiple-choice" ? (
          <div>
            {content.options?.map((option, index) => (
              <div key={index} className="flex items-center p-2">
                <Checkbox id={`option-${index}`} value={option} />
                <label htmlFor={`option-${index}`} className="ml-2">{option}</label>
              </div>
            ))}
          </div>
        ) : content.type === "dropdown" ? (
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {content.options?.map((option, index) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : content.type === "opt-in" ? (
          <div className="flex items-center space-x-2">
            <Checkbox id="opt-in" />
            <label htmlFor="opt-in">{content.content.trim()}</label>
          </div>
        ) : content.type === "large-heading" ? (
          <h1 className="text-2xl font-bold">{content.content}</h1>
        ) : content.type === "small-heading" ? (
          <h2 className="text-xl font-semibold">{content.content}</h2>
        ) : content.type === "body" ? (
          <p>{content.content}</p>
        ) : content.type === "caption" ? (
          <p className="italic">{content.content}</p>
        ) : content.type === "image" ? (
          <img src={content.content} alt={content.title} className="rounded-md shadow-sm" />
        ) : content.type === "short-answer" ? (
          <Input placeholder="Short answer" />
        ) : content.type === "paragraph" ? (
          <Textarea placeholder="Paragraph" />
        ) : content.type === "date-picker" ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? date.toLocaleDateString() : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    );
  }

  const addScreen = () => {
    const newScreen: Screen = {
      id: `screen_${Math.random().toString(36).replace(/[^a-zA-Z]/g, '').substring(0, 5)}`,
      title: `Screen ${screens.length + 1}`,
      content: [],
    };
    setScreens([...screens, newScreen]);
    setSelectedScreen(newScreen.id);
  };

  const constructJsonStructure = () => {
    const jsonStructure = {
      version: "6.0",
      screens: screens.map((screen, index) => ({
        id: screen.id,
        title: screen.title,
        layout: {
          type: "SingleColumnLayout",
          children: [
            {
              type: "Form",
              name: "flow_path",
              children: [
                ...screen.content.map(content => {
                  switch (content.type) {
                    case "large-heading":
                      return { type: "TextHeading", text: content.title };
                    case "small-heading":
                      return { type: "TextSubheading", text: content.title };
                    case "body":
                      return { type: "TextBody", text: content.title };
                    case "caption":
                      return { type: "TextCaption", text: content.title };
                    case "image":
                      return { type: "Image", src: content.content, alt: content.title };
                    case "short-answer":
                      return { type: "TextInput", label: content.title, name: content.id, required: content.required };
                    case "paragraph":
                      return { type: "TextArea", label: content.title, name: content.id, required: content.required };
                    case "date-picker":
                      return { type: "DatePicker", label: content.title, name: content.id, required: content.required };
                    case "single-choice":
                      return {
                        type: "RadioButtonsGroup",
                        label: content.title,
                        name: content.id,
                        "data-source": content.options?.map((option, index) => ({ id: `${index}_${option.replace(/[^a-zA-Z_]/g, '')}`, title: option })),
                        required: content.required
                      };
                    case "multiple-choice":
                      return {
                        type: "CheckboxGroup",
                        label: content.title,
                        name: content.id,
                        "data-source": content.options?.map((option, index) => ({ id: `${index}_${option.replace(/[^a-zA-Z_]/g, '')}`, title: option })),
                        required: content.required
                      };
                    case "dropdown":
                      return {
                        type: "Dropdown",
                        label: content.title,
                        name: content.id,
                        "data-source": content.options?.map((option, index) => ({ id: `${index}_${option.replace(/[^a-zA-Z_]/g, '')}`, title: option })),
                        required: content.required
                      };
                    case "opt-in":
                      return { type: "OptIn", label: content.title, name: content.id, required: content.required };
                    default:
                      return null;
                  }
                }).filter(Boolean),
                {
                  type: "Footer",
                  label: index < screens.length - 1 ? "Continue" : "Done",
                  "on-click-action": index < screens.length - 1 ? {
                    name: "navigate",
                    next: {
                      name: screens[index + 1].id,
                      type: "screen"
                    },
                    payload: screen.content.reduce((acc: Record<string, string>, content) => {
                      acc[`screen_${index}_${content.id}`] = `\${form.${content.id}}`;
                      return acc;
                    }, {})
                  } : {
                    name: "complete",
                    payload: screens.reduce((acc: Record<string, string>, s, sIndex) => {
                      s.content.forEach(content => {
                        const key = `screen_${sIndex}_${content.id}`;
                        acc[key] = sIndex === index
                          ? `\${form.${content.id}}`
                          : `\${data.screen_${sIndex}_${content.id}}`;
                      });
                      return acc;
                    }, {})
                  }
                }
              ]
            }
          ]
        },
        ...(index === screens.length - 1 ? { terminal: true } : {})
      }))
    };
    return jsonStructure;
  };

  const submitFlow = async () => {
    try {
      const flowData = {
        name: "Testing_My_Flow",
        categories: ["OTHER"],
        publish: true,
        flow_json: constructJsonStructure()
      };

      const response = await fetch('/api/flows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData)
      });

      if (!response.ok) throw new Error('Failed to create flow');
      const result = await response.json();
      toast.success('Flow created successfully');
    } catch (error) {
      toast.error('Failed to create flow');
    }
  };

  return (
    <div className="h-screen flex justify-center m-4">
      <div className="grid h-[90%] lg:grid-cols-[400px_1fr] gap-8 p-6">

        {/* Left Side */}
        <div className="space-y-4 overflow-auto p-1">
          <h2 className="font-semibold text-lg">Screens</h2>
          <ul className="space-y-2">
            {screens.map((screen) => (
              <li key={screen.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <Button variant="ghost" size="sm" className="flex-1 justify-start font-normal" onClick={() => setSelectedScreen(screen.id)}>{screen.title}</Button>
                <Button variant="ghost" size="icon" onClick={() => deleteContent(screen.id)}><X /></Button>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={addScreen}><Plus />Add new</Button>
          <hr />
          {currentScreen && (
            <section className="space-y-3">
              <Input value={currentScreen.title || ""} onChange={(e) => updateScreenTitle(currentScreen.id, e.target.value)} />
              {currentScreen.content.map((content) => (
                <Collapsible key={content.id} className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{content.type.replace("-", " ").toUpperCase()}</span>
                    </CollapsibleTrigger>
                    <Button variant="ghost" size="icon" onClick={() => deleteContent(content.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CollapsibleContent className="space-y-2">
                    {renderContentOptions(content)}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </section>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Plus />Add Content
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Type />Text</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onSelect={() => addContent("large-heading")}><Heading1 />Large Heading</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => addContent("small-heading")}><Heading2 />Small Heading</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => addContent("caption")}><Quote />Caption</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => addContent("body")}><AlignCenter />Body</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger><FileImage />Media</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onSelect={() => addContent("image")}><Image />Image</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger><MessageSquare />Text Answer</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onSelect={() => addContent("short-answer")}><Pencil />Short Answer</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => addContent("paragraph")}><AlignLeft />Paragraph</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => addContent("date-picker")}><CalendarIcon />Date Picker</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger><List />Selection</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onSelect={() => addContent("single-choice")}><CircleDot />Single Choice</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => addContent("multiple-choice")}><CheckSquare />Multiple Choice</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => addContent("dropdown")}><ChevronDown />Dropdown</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => addContent("opt-in")}><ToggleLeftIcon />Opt-in</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Side */}
        <div className="space-y-4">
          <header className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Preview</h2>
            {/* <Button variant="outline" className="gap-2" onClick={() => console.log(JSON.stringify(constructJsonStructure(), null, 2))}><Save />Save</Button> */}
            <Button variant="outline" className="gap-2" onClick={submitFlow}><Save />Save</Button>
          </header>
          <div className="w-[400px] h-[92%] bg-white rounded-3xl p-4 shadow-lg">
            <div className="h-full overflow-auto rounded-2xl border p-4">
              <h3 className="font-semibold text-lg">{currentScreen?.title}</h3>
              {currentScreen?.content.map((content) => (
                <div key={content.id} className="mt-4">
                  {renderPreviewContent(content)}
                </div>
              ))}
              <Button className="mt-3 w-full">Continue</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}