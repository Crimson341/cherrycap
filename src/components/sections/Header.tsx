'use client';

import { GithubIcon } from 'lucide-react';
import { motion } from 'motion/react';

import { Logo } from '../Logo';
import { HeaderClientWrapper } from '../HeaderWrapper';
import PortfolioInfoDialog from '../InfoDailog';
import Link from 'next/link';
import { buttonVariants } from '../ui/button';
import { cn } from '@/lib/utils';
import ToggleThemeBtn from '../ToggleThemeBtn';
import { useIsMobile } from '@/lib/useMobile';

const LOGO_WRAPPER_VARIANTS = {
  center: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  topLeft: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 'auto',
    height: 'auto',
  },
};

const logoVariants = ( isMobile: boolean) => ({
  center: {
    top: '50%',
    left: '50%',
    x: '-50%',
    y: '-50%',
    scale: isMobile ? 1.7 : 5,
  },
  topLeft: {
    top:  (isMobile ? '4px' : '8px') ,
    left:  (isMobile ? -36 : '8px') ,
    x: 0,
    y: 0,
    scale:  (isMobile ? 0.5 : 1) ,
  },
});

export const Header = ({ transition }: { transition: boolean }) => {
  const isMobile = useIsMobile();


  return (
    <HeaderClientWrapper >

    <motion.div
      variants={LOGO_WRAPPER_VARIANTS}
      initial="center"
      animate={transition ? 'topLeft' : 'center'}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className={cn(transition ? 'fixed z-50   flex mx-auto  max-w-full md:max-w-3xl items-center justify-center':"fixed z-40 flex items-center justify-center w-full ")}
    >
      <motion.div className={cn(transition ? 'absolute   full-line-top full-line-bottom top-0 h-12 z-100 border-x w-full bg-background/70 backdrop-blur-md': '')} />
      <div className="relative    w-full">
        <motion.div
          className="absolute z-110"
          variants={logoVariants(isMobile)}
          initial="center"
          animate={transition ? 'topLeft' : 'center'}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        >
          <Logo size={isMobile ? 'lg' : 'sm'} draw  />
        </motion.div>

        <motion.div
          initial={{
            top: (isMobile ? 12 : 7.5) ,
            right: -43,
            opacity: 0,
          }}
          animate={
            transition
              ? {
                  top:  (isMobile ? 8 : 7.5) ,
                  right: 12,
                  opacity: 1,
                }
              : {
                  top:  (isMobile ? 12 : 7.5) ,
                  right: -43,
                  opacity: 0,
                }
          }
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          className="absolute z-110 flex items-center gap-x-4"
        >
             <div className="flex gap-3 items-center justify-center">

         <PortfolioInfoDialog/>
          {/* <Link
            href="/blog"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "rounded-full"
            )}
          >
            <BookOpen />
          </Link> */}
          <Link
            href={"https://github.com/thuggys"}
            target="_blank"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "rounded-full"
            )}
          >
            <GithubIcon />
          </Link>
          <ToggleThemeBtn />
        </div>

        </motion.div>
      </div>
    </motion.div>
        </HeaderClientWrapper>

  );
};
