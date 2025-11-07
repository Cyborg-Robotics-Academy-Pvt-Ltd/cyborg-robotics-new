import { useEffect } from 'react';

export const useScrollToSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate viewport and element dimensions for better positioning
      const viewportHeight = window.innerHeight;
      const headerHeight = 80; // Updated header height
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.pageYOffset;

      // Calculate optimal scroll position
      let targetPosition;
      if (elementRect.height < viewportHeight - headerHeight) {
        // Center smaller sections in viewport
        const availableSpace = viewportHeight - headerHeight;
        const centerOffset = (availableSpace - elementRect.height) / 2;
        targetPosition = elementTop - headerHeight - centerOffset;
      } else {
        // For larger sections, position at top with header offset
        targetPosition = elementTop - headerHeight;
      }

      // Ensure we don't scroll past the document bounds
      const maxScroll = document.documentElement.scrollHeight - viewportHeight;
      targetPosition = Math.max(0, Math.min(targetPosition, maxScroll));

      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      });

      // Update URL hash without triggering page jump
      if (history.pushState) {
        history.pushState(null, "", `#${sectionId}`);
      }
    }
  };

  // Scroll to section if URL contains a hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        // Remove the # symbol
        const id = hash.substring(1);
        // Scroll to the element with that ID after a short delay to ensure rendering
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            scrollToSection(id);
          }
        }, 100);
      }
    }
  }, []);

  return { scrollToSection };
};