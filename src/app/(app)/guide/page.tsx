
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-3xl">
            <HelpCircle className="h-8 w-8 text-primary" />
            Full Guide
          </CardTitle>
          <CardDescription>
            Here you can see the full guide on how to use the platform effectively.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">How to buy a plan?</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
                Click the "Plans" button in the header. Read all the plans and select the one that is best for you. Then send the plan amount to the given Easypaisa account number, enter the payment Transaction ID (TID) you receive, and submit for approval. After we verify your payment, we will approve your plan. Once approved, you can start working according to your plan.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">How to work?</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
                Once your plan is active, navigate to the "View Tasks" page from the menu. Here you will see a list of tasks available for you to complete based on your plan's daily limit. Click the "View Task" button to open the link in a new tab. After completing the task (e.g., watching a video, liking a post), you will submit proof of completion.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">How to upload an assignment?</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
                After completing a task, go to the "Assignments" page. Fill in the "Assignment Title" (e.g., Daily Tasks for May 24). Then, paste the URL of the task you completed into one of the "Task URL" fields. If you have multiple tasks for the day, you can submit them all at once. Click "Submit Assignment". Your submission will be reviewed, and your earnings will be updated upon approval.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">How to get a profile picture URL?</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
                You can get a direct image URL by uploading your picture to a free image hosting service like <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Postimages</a>. After uploading, they will provide you with a "Direct Link". Copy this link and paste it into the "Image URL" field in your profile to update your picture.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">How to withdraw earnings?</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
                When your current balance is at least PKR 700, you can request a withdrawal. Go to the "Withdrawal" page, enter the amount you wish to withdraw, and provide your payment details (e.g., Easypaisa or JazzCash account name and number). We will process your request manually within 24 hours.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">More Explanation</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed space-y-2">
                <p><strong>Today's Earning vs. Current Balance:</strong> "Today's Earning" shows the amount you have earned from approved assignments for the current day only. "Current Balance" is the total amount of money you have available to withdraw. Once your daily assignments are approved, the earnings are added to your Current Balance.</p>
                <p><strong>Referral Bonus:</strong> When someone signs up using your referral code and purchases a plan, you receive a bonus. This bonus is automatically added to your "Total Earning" and your "Current Balance" as soon as their plan payment is approved.</p>
                 <p><strong>Withdrawal Process:</strong> All withdrawal requests are processed manually by our team to ensure security. This typically takes up to 24 hours. Once approved, the funds will be sent to the account you specified. The withdrawn amount will be deducted from your "Current Balance".</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
