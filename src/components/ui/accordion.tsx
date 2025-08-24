"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "react-responsive";

// Accordion Components
const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border-b last:border-b-0 border-gray-300 transition-all duration-300",
      "hover:bg-red-50 hover:shadow-md",
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex w-full">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between px-6 py-5 text-sm lg:text-lg font-semibold transition-all duration-300",
        "text-left hover:bg-red-50 rounded-lg group",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
        "[&[data-state=open]]:bg-red-50 [&[data-state=open]]:shadow-inner",
        className
      )}
      {...props}
    >
      <div className="flex items-center">
        <Star className="h-5 w-5 text-red-400 mr-3 hidden md:block" />
        <span className="text-gray-800 group-hover:text-red-700">
          {children}
        </span>
      </div>
      <ChevronDown
        className="h-5 w-5 text-red-600 transition-transform duration-300 
      [&[data-state=open]>svg]:rotate-180 group-hover:text-red-700"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden transition-all duration-300",
      "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      "bg-gradient-to-b from-red-50 to-white",
      className
    )}
    {...props}
  >
    <div className="px-6 pb-5 pt-3 text-gray-700 text-sm md:text-base">
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// Testimonial Types
type TestimonialItem = {
  id: string;
  title: string;
  subtitle: string[];
};

type TestimonialsProps = {
  testimonials: TestimonialItem[];
};

// Testimonials Component
export const Testimonials = ({ testimonials }: TestimonialsProps) => {
  const [activeItem, setActiveItem] = React.useState<string | undefined>(
    testimonials.length > 0 ? testimonials[0].id : undefined
  );

  const isLargeDevice = useMediaQuery({ query: "(min-width: 1024px)" });

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <div className="border border-gray-300 rounded-xl bg-white shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-800 to-red-900 py-4 px-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Explore Our Syllabus
          </h2>
          <p className="text-red-100 text-sm md:text-base mt-1">
            Learn more about our comprehensive curriculum
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          value={activeItem}
          onValueChange={setActiveItem}
          className="w-full divide-y divide-gray-200"
        >
          {testimonials.map(({ id, title, subtitle }) => (
            <AccordionItem
              key={id}
              value={id}
              onMouseEnter={() => isLargeDevice && setActiveItem(id)}
              onMouseLeave={() => isLargeDevice && setActiveItem(undefined)}
            >
              <AccordionTrigger>{title}</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 pl-2">
                  {subtitle.map((sub, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 bg-red-100 rounded-full p-1 mt-0.5">
                        <Check className="h-4 w-4 text-red-700" />
                      </span>
                      <span className="ml-3">{sub}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Testimonials;
