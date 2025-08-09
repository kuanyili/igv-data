Miscellaneous file formats for UCSC table dump files.  


# UCSC SNP table dump format, format = 'snp'
```
    /**
     * Columns, from UCSC documentation
     *
     * 0  bin    585    smallint(5) unsigned    Indexing field to speed chromosome range queries.
     * 1  chr    chr1    varchar(255)    Chromosome or scaffold name
     * 2  start    10000    int(10) unsigned    Start position in chromosome
     * 3  end    10001    int(10) unsigned    End position in chromosome
     * 4  name    rs1234567    varchar(255)    Name of SNP
     * 5  score    0    int(10) unsigned    Score, usually zero
     * 6  strand    +    char(1)    Relative orientation + or -
     * 7  refNCBI    A    char(1)    Reference allele from NCBI
     * 8  refUCSC    A    char(1)    Reference allele from UCSC
     * 9  observed    T    char(1)    Observed allele
     * 10 molType    DNA    varchar(255)    Molecule type, usually DNA
     * 11 class    snp    varchar(255)    Class of SNP, usually snp
     * 12 valid    1    tinyint(1) unsigned    Validity of SNP, 1 for valid
     * 13 avHet    0.001    float    Average heterozygosity
     * 14 avHetSE    0.0001    float    Standard error of average heterozygosity
     * 15 func    intergenic    varchar(255)    Functional classification of SNP, e.g., intergenic, intronic, exonic
     * 16 locType    single    varchar(255)    Location type, e.g., single for single nucleotide polymorphism
     * 17 weight    1    int(10) unsigned    Weight of SNP, usually 1
     * 18 exceptions    0    int(10) unsigned    Number of exceptions, usually 0
     * 19 submitterCount    1    int(10) unsigned    Number of submitters, usually 1
     * 20 submitters    dbSNP    varchar(255)    Submitter name
     * 21 alleleFreqCount    0    int(10) unsigned    Number of allele frequencies, usually 0
     * 22 alleles    A,T    varchar(255)    Alleles observed, e.g., A and T
     * 23 alleleNs    0,0    varchar(255)    Number of alleles observed, e.g., 0 for A and 0 for T
     * 24 alleleFreqs    0.0,0.0    varchar(255)    Allele frequencies, e.g., 0.0 for A and 0.0 for T
     * 25 bitfields   0    int(10) unsigned    Bitfields for additional information, usually 0
```


# UCSC RepeatMasker table dump format,  format = 'rmsk'
```
    /**
     * Columns, from UCSC documentation
     *
     * 0  bin    585    smallint(5) unsigned    Indexing field to speed chromosome range queries.
     * 1  swScore    1504    int(10) unsigned    Smith Waterman alignment score
     * 2  milliDiv    13    int(10) unsigned    Base mismatches in parts per thousand
     * 3  milliDel    4    int(10) unsigned    Bases deleted in parts per thousand
     * 4  milliIns    13    int(10) unsigned    Bases inserted in parts per thousand
     * 5  genoName    chr1    varchar(255)    Genomic sequence name
     * 6  genoStart    10000    int(10) unsigned    Start in genomic sequence
     * 7  genoEnd    10468    int(10) unsigned    End in genomic sequence
     * 8  genoLeft    -249240153    int(11)    -#bases after match in genomic sequence
     * 9  strand    +    char(1)    Relative orientation + or -
     * 10 repName    (CCCTAA)n    varchar(255)    Name of repeat
     * 11 repClass    Simple_repeat    varchar(255)    Class of repeat
     * 12 repFamily    Simple_repeat    varchar(255)    Family of repeat
     * 13 repStart    1    int(11)    Start (if strand is +) or -#bases after match (if strand is -) in repeat sequence
     * 14 repEnd    463    int(11)    End in repeat sequence
     * 15 repLeft    0    int(11)    -#bases after match (if strand is +) or start (if strand is -) in repeat sequence
     * 16 id    1    char(1)    First digit of id field in RepeatMasker .out file. Best ignored.
     */
```