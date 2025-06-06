"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { id, pl } from "date-fns/locale";
import { CalendarIcon, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useHeader } from "@/components/providers/header-title-provider";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import fetchData from "@/components/api/fetch-data";
import patchData from "@/components/api/patch-data";
import { useRouter, useSearchParams } from "next/navigation";

interface sentenceHandler {
    id: number;
    czas_trwania: number;
    powod: string;
    id_status: number;
    id_grupy: number;
}

interface cellHandler {
    id: number;
    pojemnosc: number;
    funkcja: string;
    nazwa: string;
}

const cells = [
    { id: "A1", description: "Cela A1 - pojedyncza" },
    { id: "A2", description: "Cela A2 - pojedyncza" },
    { id: "B1", description: "Cela B1 - dwuosobowa" },
    { id: "B2", description: "Cela B2 - dwuosobowa" },
    { id: "C1", description: "Cela C1 - wieloosobowa" },
];

// Schemat walidacji formularza
const formSchema = z.object({
    id: z.string().optional(),
    firstName: z.string().min(2, { message: "Imię musi mieć co najmniej 2 znaki" }),
    lastName: z.string().min(2, { message: "Nazwisko musi mieć co najmniej 2 znaki" }),
    middleName: z.string().optional(),
    mothersMaidenName: z.string().min(2, { message: "Nazwisko panieńskie matki musi mieć co najmniej 2 znaki" }),
    pesel: z.string().length(11, { message: "PESEL musi mieć dokładnie 11 cyfr" }).regex(/^\d+$/, { message: "PESEL może zawierać tylko cyfry" }),
    birthplace: z.string().min(2, { message: "Miejsce urodzenia musi mieć co najmniej 2 znaki" }),
    incarcerationDate: z.date({ required_error: "Data osadzenia jest wymagana" }),
    sentenceId: z.string({ required_error: "Wybierz wyrok" }),
    cellId: z.string({ required_error: "Wybierz celę" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function PrisonerForm() {
    const { setHeader } = useHeader();
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();

    useEffect(() => {
        setHeader([{ title: "Edit Prisoner", href: "/prisoners/add" }]);
    }, []);


    const prisoner = {
        id: searchParams.get("id"),
        firstName: searchParams.get("firstName"),
        lastName: searchParams.get("lastName"),
        middleName: searchParams.get("middleName") == "undefined" ? "" : searchParams.get("middleName"),
        mothersMaidenName: searchParams.get("mothersMaidenName"),
        pesel: searchParams.get("pesel"),
        birthplace: searchParams.get("birthplace"),
        incarcerationDate: new Date(searchParams.get("incarcerationDate") as string),
        sentenceId: searchParams.get("sentenceId"),
        cellId: searchParams.get("cellId"),
    }


    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: prisoner.id || "",
            firstName: prisoner.firstName || "",
            lastName:  prisoner.lastName || "",
            middleName: prisoner.middleName || "",
            mothersMaidenName:  prisoner.mothersMaidenName || "",
            pesel: prisoner.pesel || "",
            birthplace: prisoner.birthplace || "",
            incarcerationDate: prisoner.incarcerationDate || new Date(),
            sentenceId: prisoner.sentenceId || "",
            cellId: prisoner.cellId || "",
        },
    });

    const {
        data: sentenceData,
        isLoading: isLoadingSentence,
        isError: isErrorSentence,
        error: errorSentence,
        refetch: refetchSentence,
    } = useQuery({
        queryKey: ["sentences"],
        queryFn: () => fetchData("../api/sentences"),
        refetchOnWindowFocus: false,
        retry: false,
    });

    const {
        data: cellData,
        isLoading: isLoadingCell,
        isError: isErrorCell,
        error: errorCell,
        refetch: refetchCell,
    } = useQuery({
        queryKey: ["cells"],
        queryFn: () => fetchData("../api/cells"),
        refetchOnWindowFocus: false,
        retry: false,
    });

    const onSubmit = async (data: FormValues) => {
        // W rzeczywistej aplikacji tutaj byłoby wysłanie danych do API
        console.log("Dane więźnia:", data);
        toast.success("Updated prisoner", {
            description: `${data.firstName} ${data.lastName} updated.`,
        });
        await patchData("../api/convicts", data);
        form.reset();
        await queryClient.invalidateQueries({ queryKey: ["prisoners"]});
        await queryClient.invalidateQueries({ queryKey: ["dashboard/prisoners"]});
        router.push("/prisoners");
    };
    return (
        <motion.div
            className="w-full max-w-4xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
        >
            <Card className="mx-auto border-2 shadow-lg">
                <CardHeader className="flex flex-row items-center gap-6 border-b pb-6">
                    <div className="flex items-center justify-center w-32 h-32 bg-gray-100 rounded-full overflow-hidden">
                        <UserCircle className="w-28 h-28 text-gray-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{prisoner.firstName} {prisoner.lastName}</h1>
                        <p className="text-muted-foreground">Prisoner ID: {prisoner.id}</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div className="space-y-2">
                                    {/* Imię */}
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fistname</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Firstname" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Nazwisko */}
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lastname</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Lastname" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Drugie imię */}
                                <FormField
                                    control={form.control}
                                    name="middleName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Middlename</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Middlename (optiona)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Nazwisko panieńskie matki */}
                                <FormField
                                    control={form.control}
                                    name="mothersMaidenName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mother maiden name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Mother maiden name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* PESEL */}
                                <FormField
                                    control={form.control}
                                    name="pesel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>PESEL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="PESEL" maxLength={11} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Miejsce urodzenia */}
                                <FormField
                                    control={form.control}
                                    name="birthplace"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Place of birth</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Place of birth" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Data osadzenia */}
                                <FormField
                                    control={form.control}
                                    name="incarcerationDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of incarceration</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            {field.value ? format(field.value, "dd MMMM yyyy", { locale: pl }) : <span>Select Date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* ID wyroku */}
                                <FormField
                                    control={form.control}
                                    name="sentenceId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sentence</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select sentence" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {sentenceData?.map((sentence: sentenceHandler) => (
                                                        <SelectItem key={sentence.id} value={sentence.id.toString()}>
                                                            {sentence.powod}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* ID celi */}
                                <FormField
                                    control={form.control}
                                    name="cellId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cell</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Cell" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {cellData?.map((cell: cellHandler) => (
                                                        <SelectItem key={cell.id} value={cell.id.toString()}>
                                                            {cell.id}, {cell.nazwa}, {cell.funkcja}
                                                            <br></br>
                                                            <span className={"text-xs text-gray-500"}>AvaiableSpace: {cell.pojemnosc}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" className="w-full md:w-auto">
                                    Update prisoner
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
